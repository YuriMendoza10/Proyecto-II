"""
config.py
Configuración centralizada del sistema OptiAcademic.
"""

from dataclasses import dataclass
from typing import List


@dataclass(frozen=True)
class CSPConfig:
    """
    Configuración inmutable del motor CSP.
    frozen=True garantiza que no se muten los parámetros durante la ejecución.
    """
    MAX_SOLUCIONES: int = 1
    TIEMPO_MAXIMO_MS: int = 2000  # RNF-001: ≤ 2 segundos
    DIAS_SEMANA: List[str] = None
    HORAS_DIA: List[str] = None

    def __post_init__(self):
        # Dataclass frozen requiere object.__setattr__ para mutación post-init
        if self.DIAS_SEMANA is None:
            object.__setattr__(
                self, 'DIAS_SEMANA',
                ['lunes', 'martes', 'miercoles', 'jueves', 'viernes']
            )
        if self.HORAS_DIA is None:
            object.__setattr__(
                self, 'HORAS_DIA',
                ['08-10', '10-12', '12-14', '14-16', '16-18']
            )

    @property
    def franjas_totales(self) -> List[str]:
        """Genera todas las combinaciones día-hora."""
        return [
            f"{dia}_{hora}"
            for dia in self.DIAS_SEMANA
            for hora in self.HORAS_DIA
        ]


# Instancia singleton de configuración
CONFIG = CSPConfig()