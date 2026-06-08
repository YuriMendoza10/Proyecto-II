import { http, HttpResponse } from 'msw'

const API_URL = 'http://127.0.0.1:8000/api/v1'

export const mockPeriods = [
  { id: 1, code: '2026-I', name: 'Periodo 2026-I', is_active: true, status: 'ACTIVE' },
]

export const mockPrograms = [
  { id: 1, code: 'ISI', name: 'Ingenieria de Sistemas' },
]

export const mockPlans = [
  { id: 1, code: 'ISI-UC-2026', program_id: 1, status: 'ACTIVE', total_cycles: 10 },
]

export const mockSchedules = [
  {
    id: 10,
    name: 'Horario institucional 2026-I',
    status: 'DRAFT',
    source_type: 'SECTION_OFFERINGS',
    academic_period_id: 1,
    academic_period_code: '2026-I',
    academic_program_id: 1,
    academic_program_name: 'Ingenieria de Sistemas',
    curriculum_plan_id: 1,
    curriculum_plan_code: 'ISI-UC-2026',
    quality_score: 87.5,
    blocks_count: 45,
    created_at: '2026-06-01T10:00:00',
    updated_at: '2026-06-08T10:00:00',
    label: 'ISI-UC-2026 - 2026-I - DRAFT - 45 bloques - Score 87.50',
  },
  {
    id: 11,
    name: 'Horario institucional sin bloques',
    status: 'PUBLISHED',
    source_type: 'SECTION_OFFERINGS',
    academic_period_id: 1,
    academic_period_code: '2026-I',
    academic_program_id: 1,
    academic_program_name: 'Ingenieria de Sistemas',
    curriculum_plan_id: 1,
    curriculum_plan_code: 'ISI-UC-2026',
    quality_score: null,
    blocks_count: 0,
    created_at: '2026-06-02T10:00:00',
    updated_at: '2026-06-09T10:00:00',
    label: 'ISI-UC-2026 - 2026-I - PUBLISHED - 0 bloques',
  },
]

export const environmentalSummary = {
  most_used_endpoint: '/api/v1/notifications/me',
  total_requests: 12,
  total_co2: 0.00003,
  average_response_time: 8.36,
  total_bytes: 39403,
}

export const environmentalMetrics = [
  {
    measured_at: '2026-06-08T10:00:00',
    method: 'GET',
    path: '/api/v1/notifications/me',
    status_code: 200,
    response_time_ms: 8.36,
    response_size_bytes: 39403,
    estimated_co2_g: 0.00003,
  },
]

export const environmentalRanking = [
  {
    path: '/api/v1/notifications/me',
    total_requests: 12,
    total_co2: 0.00003,
    average_response_time: 8.36,
    total_bytes: 39403,
  },
]

export const handlers = [
  http.get(`${API_URL}/academic-periods`, () => HttpResponse.json(mockPeriods)),
  http.get(`${API_URL}/academic-programs`, () => HttpResponse.json(mockPrograms)),
  http.get(`${API_URL}/curriculum-plans`, () => HttpResponse.json(mockPlans)),
  http.get(`${API_URL}/institutional-csp/available-schedules`, () => HttpResponse.json(mockSchedules)),
  http.get(`${API_URL}/environmental-impact/summary`, () => HttpResponse.json(environmentalSummary)),
  http.get(`${API_URL}/environmental-impact/metrics`, () => HttpResponse.json(environmentalMetrics)),
  http.get(`${API_URL}/environmental-impact/ranking`, () => HttpResponse.json(environmentalRanking)),
]

