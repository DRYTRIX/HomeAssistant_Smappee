"""HTTP debug endpoint for live integration data snapshots."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from aiohttp import web

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .const import DATA_COORDINATOR, DOMAIN


def _excerpt(raw: Any, max_items: int = 20) -> Any:
    if isinstance(raw, dict):
        out: dict[str, Any] = {}
        for i, (k, v) in enumerate(raw.items()):
            if i >= max_items:
                out["_truncated"] = True
                break
            if isinstance(v, (dict, list)):
                out[str(k)] = f"<{type(v).__name__}>"
            else:
                out[str(k)] = v
        return out
    if isinstance(raw, list):
        return [f"<{type(x).__name__}>" for x in raw[:max_items]]
    return raw


def _select_entry_id(hass: HomeAssistant, requested: str | None) -> str | None:
    loaded = list((hass.data.get(DOMAIN) or {}).keys())
    if not loaded:
        return None
    if requested and requested in loaded:
        return requested
    return loaded[0]


class SmappeeDebugDataView(HomeAssistantView):
    """Return raw + processed integration data for debugging."""

    url = "/debug/data"
    name = "api:ha_smappee_overview:debug_data"
    requires_auth = True

    async def get(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        entry_id = _select_entry_id(hass, request.query.get("config_entry_id"))
        if not entry_id:
            return self.json(
                {
                    "ok": False,
                    "error": "integration_not_loaded",
                    "domain": DOMAIN,
                },
                status_code=404,
            )
        domain_entry = (hass.data.get(DOMAIN) or {}).get(entry_id)
        if not domain_entry:
            return self.json(
                {"ok": False, "error": "entry_not_loaded", "config_entry_id": entry_id},
                status_code=404,
            )
        coord = domain_entry[DATA_COORDINATOR]
        data = coord.data
        now = datetime.now(UTC)
        resp: dict[str, Any] = {
            "ok": True,
            "domain": DOMAIN,
            "config_entry_id": entry_id,
            "generated_at_utc": now.isoformat(),
            "coordinator": {
                "api_partial": data.api_partial,
                "last_error": data.last_error,
                "last_successful_update": data.last_successful_update.isoformat()
                if data.last_successful_update
                else None,
                "backend_health": dict(data.backend_health),
                "validation_warnings": list(data.validation_warnings),
                "counts": {
                    "chargers": len(data.chargers),
                    "sessions_active": len(data.sessions_active),
                    "sessions_recent": len(data.sessions_recent),
                    "tariffs": len(data.tariffs),
                    "alerts": len(data.alerts),
                },
            },
            "raw_incoming_excerpt": {
                "installation": _excerpt(data.installation.raw if data.installation else {}),
                "consumption": _excerpt(data.consumption.raw if data.consumption else {}),
                "chargers": [
                    {"serial": c.serial, "raw": _excerpt(c.raw)} for c in data.chargers[:10]
                ],
                "sessions": [
                    {"id": s.id, "raw": _excerpt(s.raw)}
                    for s in (data.sessions_active + data.sessions_recent)[:20]
                ],
            },
            "processed_snapshot": coord.panel_data_dict(),
        }
        return self.json(resp)

