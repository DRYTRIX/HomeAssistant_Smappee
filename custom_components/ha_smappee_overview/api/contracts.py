"""Pydantic data contracts for inbound Smappee payloads."""

from __future__ import annotations

from typing import Any

from pydantic import AliasChoices, BaseModel, ConfigDict, Field, ValidationError


class ContractValidationError(ValueError):
    """Raised when external payload shape is invalid."""


def _coerce_bool(value: Any) -> bool:
    """Safe bool coercion for API strings/numbers."""
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return value != 0
    if isinstance(value, str):
        v = value.strip().lower()
        if v in ("true", "1", "yes", "y", "on"):
            return True
        if v in ("false", "0", "no", "n", "off", ""):
            return False
    return bool(value)


class InstallationContract(BaseModel):
    model_config = ConfigDict(extra="allow")

    service_location_id: int = Field(
        validation_alias=AliasChoices("serviceLocationId", "id")
    )
    name: str | None = None
    uuid: str | None = None
    timezone: str | None = None
    devices: list[dict[str, Any]] | None = None


class ConnectorContract(BaseModel):
    model_config = ConfigDict(extra="allow")

    position: int = Field(
        default=1, validation_alias=AliasChoices("position", "connectorPosition")
    )
    mode: str = "UNKNOWN"
    current: float | None = Field(
        default=None, validation_alias=AliasChoices("current", "currentA")
    )
    charging: bool = Field(
        default=False, validation_alias=AliasChoices("charging", "sessionActive")
    )
    led_brightness: int | None = Field(default=None, alias="ledBrightness")


class ChargerContract(BaseModel):
    model_config = ConfigDict(extra="allow")

    serial: str = Field(validation_alias=AliasChoices("serialNumber", "serial"))
    name: str | None = None
    available: bool = True
    connectors: list[ConnectorContract] = Field(
        default_factory=list, validation_alias=AliasChoices("connectors", "connectorStates")
    )


class SessionContract(BaseModel):
    model_config = ConfigDict(extra="allow")

    session_id: str = Field(validation_alias=AliasChoices("id", "sessionId"))
    connector_position: int = Field(
        default=1, validation_alias=AliasChoices("connectorPosition", "connector")
    )
    status: str = Field(default="UNKNOWN", validation_alias=AliasChoices("status", "state"))
    charging_station_serial: str | None = Field(
        default=None, validation_alias=AliasChoices("chargingStationSerial")
    )
    energy_wh: float | None = Field(default=None, validation_alias=AliasChoices("energy", "energyWh"))
    duration_seconds: int | None = Field(
        default=None, validation_alias=AliasChoices("duration", "durationSeconds")
    )
    start_raw: Any = Field(default=None, validation_alias=AliasChoices("startTime", "start"))
    end_raw: Any = Field(default=None, validation_alias=AliasChoices("endTime", "end"))
    user_id: Any = None
    card_id: Any = None
    solar_share: float | None = None


class TariffContract(BaseModel):
    model_config = ConfigDict(extra="allow")

    tariff_id: str | None = Field(default=None, validation_alias=AliasChoices("id", "tariffId"))
    name: str | None = Field(default=None, validation_alias=AliasChoices("name", "label"))
    currency: str | None = None
    price: float | None = Field(
        default=None, validation_alias=AliasChoices("pricePerKwh", "price", "unitPrice")
    )


class AlertContract(BaseModel):
    model_config = ConfigDict(extra="allow")

    alert_id: str | None = Field(default=None, validation_alias=AliasChoices("id", "alertId", "uuid"))
    message: str | None = Field(
        default=None, validation_alias=AliasChoices("message", "text", "title")
    )
    severity: str | None = Field(default=None, validation_alias=AliasChoices("severity", "level", "type"))
    timestamp_raw: Any = Field(
        default=None, validation_alias=AliasChoices("timestamp", "created", "time")
    )


class OAuthTokenContract(BaseModel):
    model_config = ConfigDict(extra="allow")

    access_token: str
    refresh_token: str | None = None
    expires_in: int = 3600
    token_type: str | None = None


def parse_contract(model_cls: type[BaseModel], payload: Any) -> BaseModel:
    """Parse a payload into a typed contract."""
    try:
        return model_cls.model_validate(payload)
    except ValidationError as err:
        raise ContractValidationError(str(err)) from err


def parse_contract_list(model_cls: type[BaseModel], rows: list[Any]) -> list[BaseModel]:
    """Parse rows into contracts, dropping invalid rows."""
    out: list[BaseModel] = []
    for row in rows:
        try:
            out.append(model_cls.model_validate(row))
        except ValidationError:
            continue
    return out


def safe_bool(value: Any, *, default: bool = False) -> bool:
    """Boolean coercion for parser layer."""
    try:
        return _coerce_bool(value)
    except Exception:
        return default
