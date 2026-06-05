from pathlib import Path

from fastapi import APIRouter
from fastapi.responses import PlainTextResponse


router = APIRouter()

REPORT_PATH = (
    Path(__file__).resolve().parents[4]
    / "public"
    / "assets"
    / "greenframe-latest.txt"
)


@router.get(
    "/sustainability",
    response_class=PlainTextResponse,
    summary="Consultar el ultimo reporte GreenFrame",
)
def get_sustainability_report() -> PlainTextResponse:
    if not REPORT_PATH.is_file():
        return PlainTextResponse(
            "No se ha ejecutado un análisis GreenFrame todavía. "
            "Ejecuta `npm run sustainability:analyze` desde la raiz del proyecto.",
            status_code=404,
        )

    return PlainTextResponse(
        REPORT_PATH.read_text(encoding="utf-8", errors="replace")
    )
