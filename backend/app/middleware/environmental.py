import asyncio
import logging
from datetime import datetime, timezone
from time import perf_counter
from typing import Any

from app.core.database import SessionLocal
from app.services.environmental_service import EnvironmentalService


logger = logging.getLogger(__name__)


class EnvironmentalImpactMiddleware:
    EXCLUDED_PATHS = frozenset(
        {
            "/api/v1/environmental-impact",
            "/api/v1/environmental-impact/summary",
            "/api/v1/environmental-impact/metrics",
            "/api/v1/environmental-impact/ranking",
            "/api/v1/sustainability",
            "/docs",
            "/openapi.json",
            "/redoc",
            "/favicon.ico",
        }
    )
    EXCLUDED_PREFIXES = ("/docs/", "/redoc/")

    def __init__(self, app: Any):
        self.app = app
        self._pending_tasks: set[asyncio.Task] = set()

    async def __call__(self, scope: dict, receive: Any, send: Any) -> None:
        if scope["type"] != "http" or self._is_excluded(scope.get("path", "")):
            await self.app(scope, receive, send)
            return

        recorded_at = datetime.now(timezone.utc)
        started_at = perf_counter()
        response_bytes = 0
        status_code = 500

        async def measured_send(message: dict) -> None:
            nonlocal response_bytes, status_code
            if message["type"] == "http.response.start":
                status_code = message["status"]
            elif message["type"] == "http.response.body":
                response_bytes += len(message.get("body", b""))
            await send(message)

        try:
            await self.app(scope, receive, measured_send)
        finally:
            elapsed_ms = (perf_counter() - started_at) * 1000
            endpoint_path = self._get_endpoint_path(scope)
            task = asyncio.create_task(
                asyncio.to_thread(
                    self._store_metric,
                    recorded_at=recorded_at,
                    http_method=scope.get("method", "UNKNOWN"),
                    endpoint_path=endpoint_path,
                    status_code=status_code,
                    response_time_ms=elapsed_ms,
                    response_bytes=response_bytes,
                )
            )
            self._pending_tasks.add(task)
            task.add_done_callback(self._pending_tasks.discard)

    @classmethod
    def _is_excluded(cls, path: str) -> bool:
        normalized = path.rstrip("/") or "/"
        return normalized in cls.EXCLUDED_PATHS or normalized.startswith(cls.EXCLUDED_PREFIXES)

    @staticmethod
    def _get_endpoint_path(scope: dict) -> str:
        route = scope.get("route")
        return getattr(route, "path", None) or scope.get("path", "/")

    @staticmethod
    def _store_metric(**metric_data: Any) -> None:
        db = SessionLocal()
        try:
            EnvironmentalService(db).record_metric(**metric_data)
        except Exception:
            logger.exception("No se pudo registrar la metrica ambiental HTTP.")
        finally:
            db.close()
