# D:\TALLER 2\optiacademic\backend\csp_engine_profesional.py
"""
Motor CSP Profesional para generación de horarios universitarios.

Genera múltiples soluciones alternativas usando distintas estrategias de
asignación (mañana, tarde, noche, balanceado, aleatorio, compacto, extendido) 
y las evalúa con un sistema de puntuación multicriteria (0-100).
"""

import random
import copy
import logging
from typing import List, Dict, Optional, Tuple, Set

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Constantes del dominio
# ---------------------------------------------------------------------------

DIAS: List[str] = [
    "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"
]

# Todas las franjas horarias del sistema (Cobertura completa)
FRANJAS: List[Dict] = [
    # Turno mañana (07:00 - 13:30)
    {"inicio": "07:00", "fin": "08:30", "turno": "mañana", "label": "07:00 - 08:30"},
    {"inicio": "08:40", "fin": "10:10", "turno": "mañana", "label": "08:40 - 10:10"},
    {"inicio": "10:20", "fin": "11:50", "turno": "mañana", "label": "10:20 - 11:50"},
    {"inicio": "12:00", "fin": "13:30", "turno": "mañana", "label": "12:00 - 13:30"},
    # Turno tarde (14:00 - 18:50)
    {"inicio": "14:00", "fin": "15:30", "turno": "tarde",  "label": "14:00 - 15:30"},
    {"inicio": "15:40", "fin": "17:10", "turno": "tarde",  "label": "15:40 - 17:10"},
    {"inicio": "17:20", "fin": "18:50", "turno": "tarde",  "label": "17:20 - 18:50"},
    # Turno noche (19:00 - 22:10)
    {"inicio": "19:00", "fin": "20:30", "turno": "noche",  "label": "19:00 - 20:30"},
    {"inicio": "20:40", "fin": "22:10", "turno": "noche",  "label": "20:40 - 22:10"},
]

# Estrategias requeridas
ESTRATEGIAS = [
    "mañana",
    "tarde",
    "noche",
    "balanceado",
    "aleatorio",
    "compacto",
    "extendido"
]

# Límites operativos
MAX_CURSOS_POR_DIA = 4
MAX_INTENTOS_TOTALES = 50  # Para garantizar opciones variadas y llegar al mínimo


# ---------------------------------------------------------------------------
# Motor principal
# ---------------------------------------------------------------------------

class CSPEngineProfesional:

    def generar_multiples_horarios(
        self,
        cursos: List[dict],
        aulas: List[dict],
        docentes: List[dict],
        semestre: int,
        num_soluciones: int = 5,
        preferencias_estudiante: Optional[dict] = None,
    ) -> dict:
        """Genera múltiples horarios distintos aplicando las 7 estrategias solicitadas."""
        
        # Filtrar cursos del semestre
        cursos_semestre = [c for c in cursos if c.get("semestre") == semestre]

        if not cursos_semestre or not aulas:
            return {"soluciones": [], "mejor_solucion": None, "total_soluciones": 0}

        # Asegurarse de devolver mínimo 5, o lo que pida num_soluciones si es mayor
        target_soluciones = max(5, num_soluciones)

        soluciones: List[dict] = []
        intentos = 0

        # Mapeamos las estrategias base
        estrategias_a_probar = copy.deepcopy(ESTRATEGIAS)
        random.shuffle(estrategias_a_probar) # Mezclamos el orden en que se prueban

        # Bucle de generación principal
        while len(soluciones) < target_soluciones and intentos < MAX_INTENTOS_TOTALES:
            # Seleccionar estrategia (cíclica si se agotan)
            estrategia_actual = estrategias_a_probar[intentos % len(estrategias_a_probar)]
            
            # En los primeros intentos, generamos sin aleatoriedad (greedy puro)
            # Luego activamos aleatoriedad para seguir sacando soluciones únicas
            aleatoriedad = intentos >= len(ESTRATEGIAS)

            solucion = self._generar_solucion(
                cursos=cursos_semestre, 
                aulas=aulas, 
                docentes=docentes,
                estrategia=estrategia_actual,
                aleatorio=aleatoriedad
            )

            # Validar que asignó al menos algo
            if solucion and solucion["estadisticas"]["total_asignados"] > 0:
                # Comprobar unicidad
                if not self._es_duplicado(solucion, soluciones):
                    soluciones.append(solucion)

            intentos += 1

        # Ordenar por puntuación descendente
        soluciones.sort(key=lambda s: s.get("puntuacion", 0), reverse=True)

        return {
            "soluciones": soluciones,
            "mejor_solucion": soluciones[0] if soluciones else None,
            "total_soluciones": len(soluciones),
        }

    # ------------------------------------------------------------------
    # Generación de una solución
    # ------------------------------------------------------------------

    def _generar_solucion(
        self,
        cursos: List[dict],
        aulas: List[dict],
        docentes: List[dict],
        estrategia: str,
        aleatorio: bool
    ) -> Optional[dict]:
        
        # 1. ORDENAR CURSOS
        cursos_orden = list(cursos)
        if aleatorio:
            random.shuffle(cursos_orden)
        else:
            cursos_orden.sort(key=lambda c: -c.get("creditos", 0))

        # 2. ORDENAR DIAS SEGÚN ESTRATEGIA
        dias_orden = DIAS.copy()
        if estrategia == "compacto":
            # Compacto: Priorizar de Lunes a Miércoles
            dias_orden = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
        elif estrategia == "extendido":
            # Extendido: Intercalar días (Lunes, Miercoles, Viernes...)
            dias_orden = ["Lunes", "Miércoles", "Viernes", "Sábado", "Domingo", "Martes", "Jueves"]
        elif aleatorio:
            random.shuffle(dias_orden)

        # 3. ORDENAR FRANJAS SEGÚN ESTRATEGIA
        franjas_orden = FRANJAS.copy()
        if estrategia in ["mañana", "tarde", "noche"]:
            # Poner las franjas de ese turno primero
            franjas_orden.sort(key=lambda f: 0 if f["turno"] == estrategia else 1)
        elif aleatorio:
            random.shuffle(franjas_orden)

        # 4. VARIABLES DE ESTADO Y RESTRICCIONES
        ocupacion_docente: Dict[str, bool] = {}   # "docente_id|dia|franja_inicio"
        ocupacion_aula:    Dict[str, bool] = {}   # "aula_id|dia|franja_inicio"
        cursos_por_dia:    Dict[str, int]  = {d: 0 for d in DIAS}
        asignaciones: List[dict] = []

        aulas_por_tipo = self._indexar_aulas_por_tipo(aulas)

        # 5. ASIGNACIÓN GREEDY
        for curso in cursos_orden:
            # Dependiendo de la estrategia, el límite de cursos/día varía
            limite_dia = MAX_CURSOS_POR_DIA
            if estrategia == "extendido":
                # Extendido requiere esparcir: bajamos el max por día
                limite_dia = 2 
            elif estrategia == "compacto":
                # Compacto requiere agrupar
                limite_dia = 5

            self._intentar_asignar(
                curso=curso,
                aulas_por_tipo=aulas_por_tipo,
                franjas_orden=franjas_orden,
                dias_orden=dias_orden,
                ocupacion_docente=ocupacion_docente,
                ocupacion_aula=ocupacion_aula,
                cursos_por_dia=cursos_por_dia,
                asignaciones=asignaciones,
                limite_dia=limite_dia
            )

        # 6. RESULTADO Y PUNTUACIÓN
        estadisticas = self._calcular_estadisticas(asignaciones, len(cursos), cursos_por_dia)
        solucion = {
            "horario_generado": asignaciones,
            "estadisticas": estadisticas,
            "estrategia": estrategia,
            "puntuacion": 0.0,
        }
        solucion["puntuacion"] = self._calcular_puntuacion(solucion)
        return solucion

    def _intentar_asignar(
        self,
        curso: dict,
        aulas_por_tipo: Dict[str, List[dict]],
        franjas_orden: List[dict],
        dias_orden: List[str],
        ocupacion_docente: Dict[str, bool],
        ocupacion_aula: Dict[str, bool],
        cursos_por_dia: Dict[str, int],
        asignaciones: List[dict],
        limite_dia: int
    ) -> bool:
        docente_id = curso.get("docente_id") or f"DOC_{curso.get('id', 'X')}"
        tipo_curso = curso.get("tipo", "teoria")
        capacidad = curso.get("max_estudiantes", 30)

        for dia in dias_orden:
            # Restricción: Max cursos por día
            if cursos_por_dia[dia] >= limite_dia:
                continue

            for franja in franjas_orden:
                # Restricción: Docente
                key_doc = f"{docente_id}|{dia}|{franja['inicio']}"
                if ocupacion_docente.get(key_doc):
                    continue

                # Restricción: Aula
                aula = self._seleccionar_aula(aulas_por_tipo, tipo_curso, capacidad, dia, franja["inicio"], ocupacion_aula)
                if not aula:
                    continue

                key_aula = f"{aula['id']}|{dia}|{franja['inicio']}"

                # ASIGNAR
                asignaciones.append({
                    "curso_id":       curso.get("codigo", str(curso.get("id", ""))),
                    "curso_nombre":   curso.get("nombre", "Sin nombre"),
                    "docente_id":     docente_id,
                    "aula_id":        aula.get("codigo") or aula.get("id"),
                    "dia":            dia,
                    "turno":          franja["turno"],
                    "franja_inicio":  franja["inicio"],
                    "franja_fin":     franja["fin"],
                    "franja_horaria": franja["label"],
                    "franja":         f"{dia} {franja['label']}",
                    "tipo":           tipo_curso,
                    "semestre":       curso.get("semestre", 1),
                    "creditos":       curso.get("creditos", 0),
                })
                
                ocupacion_docente[key_doc] = True
                ocupacion_aula[key_aula] = True
                cursos_por_dia[dia] += 1
                return True

        return False


    def _indexar_aulas_por_tipo(self, aulas: List[dict]) -> Dict[str, List[dict]]:
        indice = {"todas": []}
        for aula in aulas:
            tipo = aula.get("tipo", "teoria")
            if tipo not in indice:
                indice[tipo] = []
            indice[tipo].append(aula)
            indice["todas"].append(aula)
        
        for k in indice:
            indice[k].sort(key=lambda a: a.get("capacidad", 0))
        return indice


    def _seleccionar_aula(
        self,
        aulas_por_tipo: Dict[str, List[dict]],
        tipo_curso: str,
        capacidad_requerida: int,
        dia: str,
        franja_inicio: str,
        ocupacion_aula: Dict[str, bool],
    ) -> Optional[dict]:
        candidatas = aulas_por_tipo.get(tipo_curso, []) + aulas_por_tipo.get("todas", [])
        vistos = set()
        
        for aula in candidatas:
            aid = aula.get("id")
            if aid in vistos:
                continue
            vistos.add(aid)
            
            if aula.get("capacidad", 0) < capacidad_requerida:
                continue
                
            key = f"{aid}|{dia}|{franja_inicio}"
            if not ocupacion_aula.get(key):
                return aula
        return None

    # ------------------------------------------------------------------
    # Puntuación Avanzada
    # ------------------------------------------------------------------

    def _calcular_estadisticas(self, asignaciones: List[dict], total: int, cursos_por_dia: dict) -> dict:
        turnos = {"mañana": 0, "tarde": 0, "noche": 0}
        for a in asignaciones:
            turnos[a["turno"]] += 1
            
        return {
            "total_asignados": len(asignaciones),
            "total_no_asignados": total - len(asignaciones),
            "distribucion_dias": dict(cursos_por_dia),
            "distribucion_turnos": turnos
        }

    def _calcular_puntuacion(self, solucion: dict) -> float:
        """
        Calcula la puntuación (0-100%):
        - Porcentaje de asignación (40%)
        - Distribución de turnos (30%) - Premia tener >= 2 turnos cubiertos
        - Distribución de días (30%) - Premia una distribución equitativa
        """
        stats = solucion["estadisticas"]
        total = stats["total_asignados"] + stats["total_no_asignados"]
        if total == 0: return 0.0

        # 1. Asignación (40 pts)
        pts_asignacion = (stats["total_asignados"] / total) * 40.0

        # 2. Distribución de Turnos (30 pts)
        # Se pide que usen al menos 2 turnos para que no esté todo apretado en uno solo.
        turnos_activos = sum(1 for v in stats["distribucion_turnos"].values() if v > 0)
        # Si tiene 2 o más turnos activos, se gana todos los puntos
        pts_turnos = 30.0 if turnos_activos >= 2 else 15.0

        # 3. Distribución de Días (30 pts)
        dias_usados = sum(1 for v in stats["distribucion_dias"].values() if v > 0)
        # Una distribución ideal usa unos 4 a 6 días en total
        if 4 <= dias_usados <= 6:
            pts_dias = 30.0
        elif dias_usados == 7 or dias_usados == 3:
            pts_dias = 20.0
        else:
            pts_dias = 10.0

        puntuacion = pts_asignacion + pts_turnos + pts_dias
        return round(min(puntuacion, 100.0), 1)

    def _es_duplicado(self, nueva: dict, existentes: List[dict]) -> bool:
        def firma(s):
            return frozenset((a["curso_id"], a["dia"], a["franja_inicio"]) for a in s["horario_generado"])
        
        f_nueva = firma(nueva)
        return any(f_nueva == firma(ex) for ex in existentes)