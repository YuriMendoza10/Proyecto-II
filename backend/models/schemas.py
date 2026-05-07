# D:\TALLER 2\optiacademic\backend\models\schemas.py
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class HorarioRequest(BaseModel):
    cursos: List[Any]
    aulas: List[Any]
    docentes: List[Any]
    periodo: Optional[str] = "2025-1"

class HorarioResponse(BaseModel):
    horario_generado: List[Dict[str, Any]]
    estadisticas: Dict[str, Any]
    mensaje: Optional[str] = None

class GuardarSolucionRequest(BaseModel):
    semestre: int
    horario_generado: List[Dict[str, Any]]