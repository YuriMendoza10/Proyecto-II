import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.database import SessionLocal
from app.middleware.environmental import EnvironmentalImpactMiddleware
from app.services.environmental_service import EnvironmentalService


logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    db = SessionLocal()
    try:
        EnvironmentalService(db).clear_metrics()
    except Exception:
        logger.exception("No se pudieron limpiar las metricas ambientales al iniciar.")
    finally:
        db.close()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        debug=settings.DEBUG,
        lifespan=lifespan,
        description=(
            "Backend de OptiAcademic - Sistema inteligente de generación "
            "y optimización de horarios universitarios."
        ),
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(EnvironmentalImpactMiddleware)

    app.include_router(
        api_router,
        prefix=settings.API_V1_PREFIX,
    )

    return app


app = create_app()


@app.get("/", tags=["Root"])
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }
