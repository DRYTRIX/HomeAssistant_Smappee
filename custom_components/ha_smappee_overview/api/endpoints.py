"""URL builders and pure JSON parsing (no I/O)."""

from __future__ import annotations

import logging
from datetime import UTC, datetime
from typing import Any

from ..models import (
    AlertItem,
    ChargingSession,
    ConnectorState,
    ConsumptionSummary,
    EVCharger,
    Installation,
    PhaseMetrics,
    Submeter,
    TariffInfo,
)
from ..time_utils import parse_utc_epoch_ms
from .contracts import (
    AlertContract,
    ChargerContract,
    ContractValidationError,
    ConnectorContract,
    InstallationContract,
    SessionContract,
    TariffContract,
    parse_contract,
    safe_bool,
)

_LOGGER = logging.getLogger(__name__)


def servicelocations_url(extended: bool = True) -> str:
    """GET service locations list."""
    q = "?extendedMode=1" if extended else ""
    return f"/dev/v2/servicelocation{q}"


def parse_installations(payload: list[dict[str, Any]] | dict[str, Any]) -> list[Installation]:
    """Parse servicelocation list response."""
    if isinstance(payload, dict):
        items = payload.get("serviceLocations")
        if items is None:
            sl_alt = payload.get("serviceLocation")
            if isinstance(sl_alt, list):
                items = sl_alt
            elif isinstance(sl_alt, dict):
                items = [sl_alt]
            else:
                items = []
        if not items and "id" in payload:
            items = [payload]
    else:
        items = payload
    out: list[Installation] = []
    rows = [row for row in items if isinstance(row, dict)]
    for row in rows:
        try:
            c = parse_contract(InstallationContract, row)
        except ContractValidationError:
            continue
        sid = int(c.service_location_id)  # type: ignore[union-attr]
        if sid <= 0:
            continue
        name = str(c.name or f"Location {sid}")
        uuid_val = c.uuid
        tz = c.timezone
        serial = None
        if c.devices:
            devs = c.devices
            if isinstance(devs, list) and devs:
                d0 = devs[0]
                if isinstance(d0, dict):
                    serial = str(d0.get("serialNumber") or d0.get("serial") or "")
        out.append(
            Installation(
                id=sid,
                name=name,
                uuid=str(uuid_val) if uuid_val else None,
                timezone=str(tz) if tz else None,
                serial=serial or None,
                raw=dict(row),
            )
        )
    return out


def _parse_ts_ms(value: Any) -> datetime | None:
    if value is None:
        return None
    try:
        raw = int(value)
    except (TypeError, ValueError):
        return None
    # Some payloads return epoch seconds while others use milliseconds.
    if raw <= 9_999_999_999:
        raw *= 1000
    return parse_utc_epoch_ms(raw)


def parse_consumption_summary(
    raw: dict[str, Any],
    *,
    stale: bool = False,
) -> ConsumptionSummary:
    """Map Smappee realtime / consumption payload to ConsumptionSummary."""
    now = datetime.now(UTC)
    # Common field names vary by API version; try several
    def f(*keys: str) -> float | None:
        for k in keys:
            v = raw.get(k)
            if v is not None:
                try:
                    return float(v)
                except (TypeError, ValueError):
                    pass
        return None

    submeters: list[Submeter] = []
    loads = raw.get("loads") or raw.get("submeters") or raw.get("channels") or []
    if isinstance(loads, list):
        for i, item in enumerate(loads):
            if not isinstance(item, dict):
                continue
            def item_f(*keys: str) -> float | None:
                for k in keys:
                    v = item.get(k)
                    if v is not None:
                        try:
                            return float(v)
                        except (TypeError, ValueError):
                            pass
                return None
            sid = str(item.get("id") or item.get("channel") or i)
            name = str(item.get("name") or item.get("label") or f"Load {sid}")
            submeters.append(
                Submeter(
                    id=sid,
                    name=name,
                    power_w=item_f("power", "activePower"),
                    energy_wh=item_f("energy", "totalEnergy"),
                    phase=item.get("phase") if isinstance(item.get("phase"), int) else None,
                    raw=item,
                )
            )

    phases = raw.get("phases") or raw.get("phaseMeasurements") or raw.get("voltages")
    pm = parse_phase_metrics(phases if isinstance(phases, dict) else raw)

    return ConsumptionSummary(
        timestamp=now,
        stale=stale,
        grid_import_w=f("gridImport", "gridImportPower", "GRID_IMPORT"),
        grid_export_w=f("gridExport", "gridExportPower", "GRID_EXPORT"),
        solar_w=f("solar", "solarPower", "SOLAR"),
        consumption_w=f("consumption", "totalConsumption", "CONSUMPTION"),
        battery_flow_w=f("battery", "batteryPower", "BATTERY"),
        always_on_w=f("alwaysOn", "alwaysOnPower"),
        gas_m3=f("gas", "gasConsumption"),
        water_m3=f("water", "waterConsumption"),
        self_consumption_pct=f("selfConsumption", "selfConsumptionPercentage"),
        self_sufficiency_pct=f("selfSufficiency", "selfSufficiencyPercentage"),
        battery_soc_pct=f("batterySoc", "batterySOC", "stateOfCharge", "soc"),
        phase_metrics=pm,
        submeters=submeters,
        raw=dict(raw),
    )


def parse_phase_metrics(raw: dict[str, Any]) -> PhaseMetrics | None:
    """Extract L1/L2/L3 V, A, W from assorted API shapes."""

    def fv(*keys: str) -> float | None:
        for k in keys:
            v = raw.get(k)
            if v is not None:
                try:
                    return float(v)
                except (TypeError, ValueError):
                    pass
        return None

    l1v = fv("l1Voltage", "phase1Voltage", "voltageL1", "L1_V")
    l2v = fv("l2Voltage", "phase2Voltage", "voltageL2", "L2_V")
    l3v = fv("l3Voltage", "phase3Voltage", "voltageL3", "L3_V")
    l1a = fv("l1Current", "phase1Current", "currentL1", "L1_A")
    l2a = fv("l2Current", "phase2Current", "currentL2", "L2_A")
    l3a = fv("l3Current", "phase3Current", "currentL3", "L3_A")
    l1p = fv("l1Power", "phase1Power", "activePowerL1", "L1_W")
    l2p = fv("l2Power", "phase2Power", "activePowerL2", "L2_W")
    l3p = fv("l3Power", "phase3Power", "activePowerL3", "L3_W")
    if all(
        x is None
        for x in (l1v, l2v, l3v, l1a, l2a, l3a, l1p, l2p, l3p)
    ):
        return None
    return PhaseMetrics(
        l1_voltage=l1v,
        l2_voltage=l2v,
        l3_voltage=l3v,
        l1_current=l1a,
        l2_current=l2a,
        l3_current=l3a,
        l1_power_w=l1p,
        l2_power_w=l2p,
        l3_power_w=l3p,
    )


def parse_tariffs_payload(payload: Any) -> list[TariffInfo]:
    """Best-effort tariff list."""
    if payload is None:
        return []
    rows: list[Any]
    if isinstance(payload, list):
        rows = payload
    elif isinstance(payload, dict):
        rows = (
            payload.get("tariffs")
            or payload.get("items")
            or payload.get("data")
            or []
        )
    else:
        return []
    out: list[TariffInfo] = []
    row_dicts = [row for row in rows if isinstance(row, dict)]
    for row in row_dicts:
        try:
            c = parse_contract(TariffContract, row)
        except ContractValidationError:
            continue
        tid = c.tariff_id  # type: ignore[union-attr]
        name = c.name  # type: ignore[union-attr]
        cur = c.currency  # type: ignore[union-attr]
        pf = c.price  # type: ignore[union-attr]
        out.append(
            TariffInfo(
                id=str(tid) if tid is not None else None,
                name=str(name) if name else None,
                currency=str(cur) if cur else None,
                price_per_kwh=pf,
                raw=dict(row),
            )
        )
    return out


def parse_alerts_payload(payload: Any) -> list[AlertItem]:
    """Parse alerts / notifications list."""
    if payload is None:
        return []
    if isinstance(payload, dict):
        rows = (
            payload.get("alerts")
            or payload.get("notifications")
            or payload.get("items")
            or payload.get("messages")
            or []
        )
    elif isinstance(payload, list):
        rows = payload
    else:
        return []
    out: list[AlertItem] = []
    row_dicts = [row for row in rows if isinstance(row, dict)]
    for row in row_dicts:
        try:
            c = parse_contract(AlertContract, row)
        except ContractValidationError:
            continue
        aid = c.alert_id  # type: ignore[union-attr]
        if aid is None:
            aid = f"alert-{str(row)[:80]}"
        msg = c.message or ""  # type: ignore[union-attr]
        if not msg:
            continue
        sev = c.severity  # type: ignore[union-attr]
        ts = _parse_ts_ms(c.timestamp_raw)  # type: ignore[union-attr]
        out.append(
            AlertItem(
                id=str(aid),
                message=str(msg),
                severity=str(sev) if sev else None,
                created_at=ts,
                raw=dict(row),
            )
        )
    return out


def phase_metrics_has_three_phase(pm: PhaseMetrics | None) -> bool:
    """True if at least two phases report data."""
    if pm is None:
        return False
    volts = [pm.l1_voltage, pm.l2_voltage, pm.l3_voltage]
    currents = [pm.l1_current, pm.l2_current, pm.l3_current]
    v_count = sum(1 for x in volts if x is not None and x > 0)
    a_count = sum(1 for x in currents if x is not None)
    return v_count >= 2 or a_count >= 2


def parse_ev_charger(row: dict[str, Any]) -> EVCharger:
    """Parse charging station from API."""
    try:
        c = ChargerContract.model_validate(row)
    except Exception:
        c = ChargerContract(serial=str(row.get("serialNumber") or row.get("serial") or ""))
    serial = str(c.serial or "")
    name = str(c.name or serial or "Charger")
    connectors: list[ConnectorState] = []
    conns = row.get("connectors") or row.get("connectorStates") or []
    conn_rows = [x for x in conns if isinstance(x, dict)] if isinstance(conns, list) else []
    for conn_row in conn_rows:
        try:
            cc = parse_contract(ConnectorContract, conn_row)
        except ContractValidationError:
            continue
        pos = cc.position if cc.position > 0 else len(connectors) + 1  # type: ignore[union-attr]
        mode = str(cc.mode or "UNKNOWN").upper()  # type: ignore[union-attr]
        if mode not in ("NORMAL", "SMART", "PAUSED"):
            mode = "UNKNOWN"
        connectors.append(
            ConnectorState(
                position=pos,
                mode=mode,  # type: ignore[arg-type]
                current_a=cc.current,  # type: ignore[union-attr]
                session_active=safe_bool(cc.charging, default=False),  # type: ignore[union-attr]
                led_brightness_pct=cc.led_brightness,  # type: ignore[union-attr]
                raw=conn_row,
            )
        )
    return EVCharger(
        serial=serial,
        name=name,
        connectors=connectors,
        availability=safe_bool(c.available, default=True),
        last_sync=datetime.now(UTC),
        raw=dict(row),
    )


def _float_or_none(v: Any) -> float | None:
    if v is None:
        return None
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def _int_or_none(v: Any) -> int | None:
    if v is None:
        return None
    try:
        return int(v)
    except (TypeError, ValueError):
        return None


def _session_cost_fields(row: dict[str, Any]) -> tuple[float | None, str | None, str | None]:
    """Extract (amount, currency, tariff_id) from assorted API key names."""
    amount: float | None = None
    for k in (
        "totalCost",
        "cost",
        "totalPrice",
        "price",
        "sessionCost",
        "amount",
        "costTotal",
    ):
        if k in row:
            amount = _float_or_none(row.get(k))
            if amount is not None:
                break
    currency: str | None = None
    for k in ("currency", "priceCurrency", "costCurrency", "currencyCode"):
        v = row.get(k)
        if v is not None and str(v).strip():
            currency = str(v).strip().upper()[:8]
            break
    tid = row.get("tariffId") or row.get("tariff_id") or row.get("appliedTariffId")
    tariff_id = str(tid) if tid is not None and str(tid).strip() else None
    return amount, currency, tariff_id


def _session_user_card_labels(row: dict[str, Any]) -> tuple[str | None, str | None]:
    user_label: str | None = None
    for k in ("userName", "userLabel", "driverName", "rfidName", "displayName"):
        v = row.get(k)
        if isinstance(v, str) and v.strip():
            user_label = v.strip()[:200]
            break
    card_label: str | None = None
    for k in ("cardName", "cardLabel", "rfidLabel", "tagName"):
        v = row.get(k)
        if isinstance(v, str) and v.strip():
            card_label = v.strip()[:200]
            break
    return user_label, card_label


def parse_charging_session(row: dict[str, Any], charger_serial: str = "") -> ChargingSession | None:
    """Parse one session row."""
    if not isinstance(row, dict):
        return None
    try:
        c = SessionContract.model_validate(row)
    except Exception:
        return None
    sid = str(c.session_id).strip()
    if sid == "":
        return None
    connector = c.connector_position if c.connector_position > 0 else 1
    status = str(c.status or "UNKNOWN")
    cost_amt, cost_cur, tariff_id = _session_cost_fields(row)
    user_lbl, card_lbl = _session_user_card_labels(row)
    return ChargingSession(
        id=sid,
        charger_serial=str(c.charging_station_serial or charger_serial),
        connector=connector,
        status=status,
        energy_wh=c.energy_wh,
        duration_s=c.duration_seconds,
        start=_parse_ts_ms(c.start_raw),
        end=_parse_ts_ms(c.end_raw),
        user_id=str(c.user_id) if c.user_id is not None else None,
        card_id=str(c.card_id) if c.card_id is not None else None,
        user_label=user_lbl,
        card_label=card_lbl,
        solar_share_pct=c.solar_share,
        cost_amount=cost_amt,
        cost_currency=cost_cur,
        tariff_id=tariff_id,
        raw=dict(row),
    )


def parse_charging_sessions(
    payload: dict[str, Any] | list[dict[str, Any]],
    charger_serial: str = "",
) -> list[ChargingSession]:
    """Parse sessions list from API."""
    if isinstance(payload, list):
        rows = payload
    else:
        rows = payload.get("sessions") or payload.get("chargingSessions") or payload.get("items") or []
    out: list[ChargingSession] = []
    for row in rows:
        s = parse_charging_session(row if isinstance(row, dict) else {}, charger_serial)
        if s:
            out.append(s)
    return out
