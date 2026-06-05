export function extractList(data) {
    if (!data) return []

    if (Array.isArray(data)) return data

    if (Array.isArray(data.items)) return data.items
    if (Array.isArray(data.results)) return data.results
    if (Array.isArray(data.data)) return data.data
    if (Array.isArray(data.records)) return data.records

    if (Array.isArray(data.users)) return data.users
    if (Array.isArray(data.courses)) return data.courses
    if (Array.isArray(data.classrooms)) return data.classrooms
    if (Array.isArray(data.teachers)) return data.teachers
    if (Array.isArray(data.sections)) return data.sections
    if (Array.isArray(data.students)) return data.students
    if (Array.isArray(data.schedules)) return data.schedules
    if (Array.isArray(data.academic_schedules)) return data.academic_schedules

    return []
}

export function getErrorMessage(error, fallback = 'Ocurrió un error') {
    const detail = error.response?.data?.detail

    if (!detail) return fallback

    if (typeof detail === 'string') return detail

    if (Array.isArray(detail)) {
        return detail.map((item) => item.msg || JSON.stringify(item)).join(' | ')
    }

    if (typeof detail === 'object') {
        return detail.msg || JSON.stringify(detail)
    }

    return fallback
}