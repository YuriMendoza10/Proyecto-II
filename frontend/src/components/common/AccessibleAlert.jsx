import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'

const styles = {
    success: ['border-emerald-700 bg-emerald-50 text-emerald-950', CheckCircle2],
    warning: ['border-amber-700 bg-amber-50 text-amber-950', AlertTriangle],
    error: ['border-red-700 bg-red-50 text-red-950', AlertCircle],
    info: ['border-blue-700 bg-blue-50 text-blue-950', Info],
}

export default function AccessibleAlert({ type = 'info', title, message }) {
    const [className, Icon] = styles[type] || styles.info
    const urgent = type === 'error' || type === 'warning'

    return (
        <div
            className={`flex gap-3 rounded-lg border-l-4 p-4 ${className}`}
            role={urgent ? 'alert' : 'status'}
            aria-live={urgent ? 'assertive' : 'polite'}
        >
            <Icon className="mt-0.5 shrink-0" size={20} aria-hidden="true" />
            <div>
                {title && <p className="font-bold">{title}</p>}
                {message && <p className="text-sm">{message}</p>}
            </div>
        </div>
    )
}
