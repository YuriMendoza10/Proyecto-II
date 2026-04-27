# D:\TALLER 2\optiacademic\backend\csp_engine.py
import time
import random
import copy
from typing import List, Dict, Any, Optional


class CSPEngine:
    """Motor CSP base — genera UNA solución óptima."""

    def __init__(self):
        self.franjas_base = [
            {'inicio': '07:30', 'fin': '09:00', 'duracion': 90,  'turno': 'mañana'},
            {'inicio': '09:10', 'fin': '10:40', 'duracion': 90,  'turno': 'mañana'},
            {'inicio': '10:50', 'fin': '12:20', 'duracion': 90,  'turno': 'mañana'},
            {'inicio': '12:30', 'fin': '14:00', 'duracion': 90,  'turno': 'tarde'},
            {'inicio': '14:10', 'fin': '15:40', 'duracion': 90,  'turno': 'tarde'},
            {'inicio': '15:50', 'fin': '17:20', 'duracion': 90,  'turno': 'tarde'},
            {'inicio': '17:30', 'fin': '19:00', 'duracion': 90,  'turno': 'noche'},
            {'inicio': '19:10', 'fin': '20:40', 'duracion': 90,  'turno': 'noche'},
        ]
        self.franjas_extendidas = [
            {'inicio': '07:30', 'fin': '10:30', 'duracion': 180, 'turno': 'mañana'},
            {'inicio': '10:40', 'fin': '13:40', 'duracion': 180, 'turno': 'mañana'},
            {'inicio': '14:10', 'fin': '17:10', 'duracion': 180, 'turno': 'tarde'},
            {'inicio': '17:30', 'fin': '20:30', 'duracion': 180, 'turno': 'noche'},
        ]
        self.dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

    # ── helpers ──────────────────────────────────────────────────────────────

    def _franjas_para_curso(self, curso: dict) -> List[dict]:
        """Devuelve lista de sub-franjas requeridas por el curso."""
        minutos = curso.get('minutos_por_hora', 90)
        horas_por_tipo = {
            'teoria':      curso.get('horas_teoria', 0),
            'laboratorio': curso.get('horas_laboratorio', 0),
            'practica':    curso.get('horas_practica', 0),
        }
        resultado = []
        for tipo, horas in horas_por_tipo.items():
            if horas > 0:
                num = max(1, int(horas) if minutos <= 90 else 1)
                for _ in range(num):
                    resultado.append({'tipo': tipo, 'duracion': minutos})
        return resultado or [{'tipo': 'teoria', 'duracion': 90}]

    def _franja_label(self, franja: dict) -> str:
        return f"{franja['inicio']} - {franja['fin']}"

    def _docente_disponible(self, docente_id: str, dia: str, franja: dict,
                             uso_docente: dict, docentes_info: dict) -> bool:
        """Verifica si el docente puede dar clase en esa franja."""
        key = f"{docente_id}__{dia}__{franja['inicio']}"
        if uso_docente.get(key, 0) >= 1:
            return False
        # Verificar disponibilidad declarada
        info = docentes_info.get(docente_id)
        if info:
            disponibilidad = info.get('disponibilidad', [])
            if disponibilidad:
                franja_str = f"{dia} {franja['inicio']}"
                if not any(franja_str in d or dia in d for d in disponibilidad):
                    return False
            # Límite de horas diarias (máx 7 h ≈ 4 franjas de 90 min)
            horas_key = f"{docente_id}__{dia}__horas"
            horas_usadas = uso_docente.get(horas_key, 0)
            if horas_usadas + franja['duracion'] > 420:   # 7 h en minutos
                return False
        return True

    def _aula_disponible(self, aula_id: str, dia: str, franja: dict,
                          uso_aulas: dict) -> bool:
        key = f"{aula_id}__{dia}__{franja['inicio']}"
        return uso_aulas.get(key, 0) == 0

    def _elegir_aula(self, tipo_curso: str, aulas: List[dict],
                      dia: str, franja: dict, uso_aulas: dict,
                      max_estudiantes: int) -> Optional[str]:
        """Elige un aula compatible disponible."""
        # Primero las que coinciden en tipo y capacidad
        candidatas = [
            a for a in aulas
            if (a.get('tipo') == tipo_curso or tipo_curso == 'teoria')
            and a.get('capacidad', 0) >= max_estudiantes
            and self._aula_disponible(a['id'], dia, franja, uso_aulas)
        ]
        if not candidatas:
            # Relajar restricción de tipo
            candidatas = [
                a for a in aulas
                if self._aula_disponible(a['id'], dia, franja, uso_aulas)
            ]
        if not candidatas:
            return None
        return min(candidatas, key=lambda a: a.get('capacidad', 9999))['id']

    # ── lógica de distribución ────────────────────────────────────────────────

    def _elegir_dia(self, tipo_franja: str, uso_dia: dict,
                    max_por_dia: int = 4) -> Optional[str]:
        """Elige el día con menos carga, respetando el máximo por día."""
        dias_validos = [d for d in self.dias if uso_dia.get(d, 0) < max_por_dia]
        if not dias_validos:
            dias_validos = self.dias  # relajar
        # Priorizar días con menos carga
        return min(dias_validos, key=lambda d: uso_dia.get(d, 0))

    def _elegir_franja(self, tipo_curso: str, duracion: int, dia: str,
                        docente_id: str, uso_franja: dict, uso_docente: dict,
                        docentes_info: dict) -> Optional[dict]:
        """Elige la mejor franja disponible según prioridades."""
        pool = self.franjas_extendidas if duracion >= 180 else self.franjas_base

        # Orden de preferencia por tipo
        if tipo_curso == 'laboratorio' or tipo_curso == 'practica':
            order = ['tarde', 'noche', 'mañana']
        else:
            order = ['mañana', 'tarde', 'noche']

        for turno in order:
            for franja in pool:
                if franja['turno'] != turno:
                    continue
                fk = f"{dia}__{franja['inicio']}"
                if uso_franja.get(fk, 0) >= 2:
                    continue
                if not self._docente_disponible(docente_id, dia, franja,
                                                uso_docente, docentes_info):
                    continue
                return franja
        # Fallback sin restricciones de turno
        for franja in pool:
            fk = f"{dia}__{franja['inicio']}"
            if uso_franja.get(fk, 0) < 2:
                return franja
        return pool[0]

    # ── resolver ─────────────────────────────────────────────────────────────

    def resolver(self, cursos: List[dict], aulas: List[dict],
                 docentes: List[dict]) -> dict:
        t0 = time.time()

        docentes_info = {d['id']: d for d in docentes}
        uso_dia: Dict[str, int] = {d: 0 for d in self.dias}
        uso_franja: Dict[str, int] = {}
        uso_docente: Dict[str, int] = {}
        uso_aulas: Dict[str, int] = {}
        asignaciones = []
        no_asignados = []

        for curso in cursos:
            sub_franjas = self._franjas_para_curso(curso)
            docente_id = curso.get('docente_id', 'DOC001')

            for sf in sub_franjas:
                dia = self._elegir_dia(sf['tipo'], uso_dia)
                if dia is None:
                    no_asignados.append(curso['id'])
                    continue

                franja = self._elegir_franja(
                    sf['tipo'], sf['duracion'], dia,
                    docente_id, uso_franja, uso_docente, docentes_info
                )

                aula_id = self._elegir_aula(
                    sf['tipo'], aulas, dia, franja, uso_aulas,
                    curso.get('max_estudiantes', 30)
                )
                if aula_id is None and aulas:
                    aula_id = aulas[0]['id']

                # Registrar uso
                uso_dia[dia] = uso_dia.get(dia, 0) + 1
                fk = f"{dia}__{franja['inicio']}"
                uso_franja[fk] = uso_franja.get(fk, 0) + 1
                dk = f"{docente_id}__{dia}__{franja['inicio']}"
                uso_docente[dk] = uso_docente.get(dk, 0) + 1
                hk = f"{docente_id}__{dia}__horas"
                uso_docente[hk] = uso_docente.get(hk, 0) + franja['duracion']
                if aula_id:
                    ak = f"{aula_id}__{dia}__{franja['inicio']}"
                    uso_aulas[ak] = uso_aulas.get(ak, 0) + 1

                label = self._franja_label(franja)
                asignaciones.append({
                    'curso_id':     curso['id'],
                    'curso_nombre': curso.get('nombre', curso['id']),
                    'docente_id':   docente_id,
                    'aula_id':      aula_id or 'N/A',
                    'dia':          dia,
                    'franja_horaria': label,
                    'franja':       f"{dia} {label}",
                    'tipo':         sf['tipo'],
                    'duracion':     sf['duracion'],
                    'semestre':     curso.get('semestre', 1),
                })

        elapsed = round((time.time() - t0) * 1000, 2)
        distribucion = {d: uso_dia.get(d, 0) for d in self.dias}

        return {
            'horario_generado': asignaciones,
            'estadisticas': {
                'total_asignados':     len(asignaciones),
                'total_no_asignados':  len(no_asignados),
                'cursos_no_asignados': no_asignados,
                'tiempo_ms':           elapsed,
                'distribucion_dias':   distribucion,
                'puntuacion':          self._calcular_puntuacion(asignaciones, distribucion),
            },
        }

    def _calcular_puntuacion(self, asignaciones: List[dict],
                              distribucion: Dict[str, int]) -> float:
        """Puntuación 0–100 basada en distribución y turno."""
        if not asignaciones:
            return 0.0

        total = len(asignaciones)
        dias_con_clases = sum(1 for v in distribucion.values() if v > 0)

        # Premiar distribución uniforme (0–40 pts)
        if dias_con_clases:
            valores = [v for v in distribucion.values() if v > 0]
            desviacion = max(valores) - min(valores)
            pts_dist = max(0, 40 - desviacion * 5)
        else:
            pts_dist = 0

        # Premiar clases de mañana para teoría (0–30 pts)
        teoria_manana = sum(
            1 for a in asignaciones
            if a['tipo'] == 'teoria' and a['franja_horaria'].startswith(('07', '09', '10'))
        )
        pts_turno = min(30, (teoria_manana / max(total, 1)) * 30)

        # Premiar uso de aulas distintas (0–30 pts)
        aulas_usadas = len({a['aula_id'] for a in asignaciones})
        pts_aulas = min(30, aulas_usadas * 6)

        return round(pts_dist + pts_turno + pts_aulas, 1)


# ═══════════════════════════════════════════════════════════════════════════════
class CSPEngineMejorado(CSPEngine):
    """
    Extiende CSPEngine con generación de MÚLTIPLES soluciones usando
    variación de semillas de aleatorización y perturbación controlada.
    """

    def generar_multiples_horarios(
        self,
        cursos: List[dict],
        aulas: List[dict],
        docentes: List[dict],
        num_soluciones: int = 5,
    ) -> List[dict]:
        """
        Genera `num_soluciones` horarios distintos y los devuelve
        ordenados por puntuación descendente.
        """
        soluciones = []

        # Estrategias de variación
        estrategias = [
            self._orden_original,
            self._orden_por_semestre,
            self._orden_por_tipo,
            self._orden_aleatorio,
            self._orden_aleatorio,         # segunda variante aleatoria
            self._orden_inverso,
            self._orden_por_docente,
            self._orden_mixto,
            self._orden_aleatorio,
            self._orden_aleatorio,
        ]

        for i in range(min(num_soluciones, len(estrategias))):
            random.seed(i * 7 + 13)       # semilla reproducible
            cursos_ordenados = estrategias[i](cursos)
            resultado = self.resolver(cursos_ordenados, aulas, docentes)
            soluciones.append(resultado)

        # Ordenar de mayor a menor puntuación
        soluciones.sort(
            key=lambda s: s['estadisticas'].get('puntuacion', 0),
            reverse=True,
        )
        return soluciones

    # ── estrategias de ordenamiento ──────────────────────────────────────────

    def _orden_original(self, cursos):
        return list(cursos)

    def _orden_por_semestre(self, cursos):
        return sorted(cursos, key=lambda c: c.get('semestre', 1))

    def _orden_por_tipo(self, cursos):
        prioridad = {'laboratorio': 0, 'taller': 1, 'practica': 2, 'teoria': 3}
        return sorted(cursos, key=lambda c: prioridad.get(c.get('tipo', 'teoria'), 3))

    def _orden_aleatorio(self, cursos):
        copia = list(cursos)
        random.shuffle(copia)
        return copia

    def _orden_inverso(self, cursos):
        return list(reversed(cursos))

    def _orden_por_docente(self, cursos):
        return sorted(cursos, key=lambda c: c.get('docente_id', ''))

    def _orden_mixto(self, cursos):
        """Intercala teoría y laboratorio para mejor distribución."""
        teoria = [c for c in cursos if c.get('tipo') == 'teoria']
        otros  = [c for c in cursos if c.get('tipo') != 'teoria']
        random.shuffle(teoria)
        random.shuffle(otros)
        resultado = []
        for t, o in zip(teoria, otros):
            resultado.extend([t, o])
        resultado.extend(teoria[len(otros):])
        resultado.extend(otros[len(teoria):])
        return resultado