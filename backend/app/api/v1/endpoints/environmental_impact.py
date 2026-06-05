from html import escape

from fastapi import APIRouter, Depends, Query
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User, UserRole
from app.schemas.environmental_schema import (
    EnvironmentalEndpointRankingResponse,
    EnvironmentalMetricResponse,
    EnvironmentalSummaryResponse,
)
from app.services.environmental_service import EnvironmentalService


router = APIRouter()


def _format_bytes(value: int) -> str:
    if value < 1024:
        return f"{value} B"
    if value < 1024 ** 2:
        return f"{value / 1024:.2f} KB"
    return f"{value / (1024 ** 2):.2f} MB"


def _render_dashboard(data: dict) -> str:
    endpoint_rows = "".join(
        (
            "<tr>"
            f"<td><code>{escape(row['path'])}</code></td>"
            f"<td>{row['total_requests']}</td>"
            f"<td>{_format_bytes(row['total_bytes'])}</td>"
            f"<td>{row['total_co2']:.10f}</td>"
            "</tr>"
        )
        for row in data["endpoints"]
    ) or '<tr><td colspan="4" class="empty">No hay solicitudes medidas en esta sesion.</td></tr>'

    metric_rows = "".join(
        (
            "<tr>"
            f"<td>{escape(metric['measured_at'].strftime('%Y-%m-%d %H:%M:%S'))}</td>"
            f"<td>{escape(metric['method'])}</td>"
            f"<td><code>{escape(metric['path'])}</code></td>"
            f"<td>{metric['status_code']}</td>"
            f"<td>{metric['response_time_ms']:.2f}</td>"
            f"<td>{_format_bytes(metric['response_size_bytes'])}</td>"
            f"<td>{metric['estimated_co2_g']:.10f}</td>"
            "</tr>"
        )
        for metric in data["recent_metrics"]
    ) or '<tr><td colspan="7" class="empty">Aun no existen metricas registradas.</td></tr>'

    return f"""<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Impacto ambiental | OptiAcademic</title>
  <style>
    :root {{ color-scheme: light; --green: #116149; --bg: #f4f8f5; --line: #d6e3da; }}
    * {{ box-sizing: border-box; }}
    body {{ margin: 0; font-family: Arial, sans-serif; color: #183229; background: var(--bg); }}
    main {{ width: min(1180px, calc(100% - 40px)); margin: 38px auto; }}
    h1 {{ color: var(--green); margin-bottom: 8px; }}
    .lead {{ margin-top: 0; color: #49665c; }}
    .cards {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(205px, 1fr)); gap: 14px; margin: 28px 0; }}
    .card, section {{ background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 18px; }}
    .label {{ display: block; color: #617e74; font-size: 13px; margin-bottom: 9px; }}
    .value {{ color: var(--green); font-size: 26px; font-weight: bold; }}
    section {{ margin-top: 18px; }}
    h2 {{ margin: 0 0 14px; font-size: 19px; }}
    .table-wrap {{ max-height: 380px; overflow: auto; border: 1px solid var(--line); border-radius: 8px; }}
    table {{ width: 100%; border-collapse: collapse; min-width: 700px; }}
    th {{ position: sticky; top: 0; background: #eaf3ed; text-align: left; font-size: 13px; }}
    th, td {{ padding: 11px 12px; border-bottom: 1px solid #e7efe9; white-space: nowrap; }}
    code {{ color: #125940; }}
    .empty {{ text-align: center; color: #617e74; }}
    footer {{ margin: 22px 0; font-size: 13px; color: #617e74; }}
  </style>
</head>
<body>
  <main>
    <h1>Impacto ambiental estimado</h1>
    <p class="lead">Metricas HTTP registradas durante la sesion activa del servidor OptiAcademic.</p>
    <div class="cards">
      <div class="card"><span class="label">Solicitudes medidas</span><span class="value">{data["total_requests"]}</span></div>
      <div class="card"><span class="label">Datos transferidos</span><span class="value">{_format_bytes(data["total_bytes"])}</span></div>
      <div class="card"><span class="label">CO2 estimado (g)</span><span class="value">{data["total_co2_g"]:.10f}</span></div>
      <div class="card"><span class="label">Tiempo promedio</span><span class="value">{data["average_response_time_ms"]:.2f} ms</span></div>
    </div>
    <section>
      <h2>Impacto por endpoint</h2>
      <div class="table-wrap"><table>
        <thead><tr><th>Ruta</th><th>Solicitudes</th><th>Bytes</th><th>CO2 estimado (g)</th></tr></thead>
        <tbody>{endpoint_rows}</tbody>
      </table></div>
    </section>
    <section>
      <h2>Metricas recientes</h2>
      <div class="table-wrap"><table>
        <thead><tr><th>Fecha UTC</th><th>Metodo</th><th>Ruta</th><th>Estado</th><th>Tiempo (ms)</th><th>Bytes</th><th>CO2 (g)</th></tr></thead>
        <tbody>{metric_rows}</tbody>
      </table></div>
    </section>
    <footer>Estimacion: bytes / (1024 ^ 3) x {data["factor_g_per_gb"]} g CO2/GB. La ruta del dashboard no se contabiliza.</footer>
  </main>
</body>
</html>"""


@router.get(
    "/environmental-impact",
    response_class=HTMLResponse,
    summary="Dashboard publico de impacto ambiental estimado",
)
def get_environmental_impact_dashboard(db: Session = Depends(get_db)) -> HTMLResponse:
    data = EnvironmentalService(db).get_dashboard_data()
    return HTMLResponse(content=_render_dashboard(data))


@router.get(
    "/environmental-impact/summary",
    response_model=EnvironmentalSummaryResponse,
    summary="Resumen de impacto ambiental para el panel administrativo",
)
def get_environmental_impact_summary(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.COORDINATOR)),
):
    return EnvironmentalService(db).get_summary()


@router.get(
    "/environmental-impact/metrics",
    response_model=list[EnvironmentalMetricResponse],
    summary="Metricas ambientales recientes para el panel administrativo",
)
def get_environmental_impact_metrics(
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.COORDINATOR)),
):
    return EnvironmentalService(db).get_metrics(limit=limit)


@router.get(
    "/environmental-impact/ranking",
    response_model=list[EnvironmentalEndpointRankingResponse],
    summary="Ranking ambiental por endpoint",
)
def get_environmental_impact_ranking(
    limit: int = Query(default=25, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.COORDINATOR)),
):
    return EnvironmentalService(db).get_ranking(limit=limit)
