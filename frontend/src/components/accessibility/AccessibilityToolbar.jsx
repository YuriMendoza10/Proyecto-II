import { RotateCcw, Type } from 'lucide-react'

import { useAccessibilityPreferences } from '../../hooks/useAccessibilityPreferences'

export default function AccessibilityToolbar() {
    const {
        textSize,
        increaseText,
        decreaseText,
        resetPreferences,
    } = useAccessibilityPreferences()

    return (
        <aside className="accessibility-toolbar" aria-label="Preferencias de accesibilidad visual">
            <button type="button" onClick={decreaseText} aria-label="Reducir tamaño del texto" title="Reducir tamaño del texto">
                <Type size={15} aria-hidden="true" />
                <span aria-hidden="true">-</span>
            </button>
            <output aria-label={`Tamaño del texto ${textSize} por ciento`}>{textSize}%</output>
            <button type="button" onClick={increaseText} aria-label="Aumentar tamaño del texto" title="Aumentar tamaño del texto">
                <Type size={18} aria-hidden="true" />
                <span aria-hidden="true">+</span>
            </button>
            <button type="button" onClick={resetPreferences} aria-label="Restablecer preferencias visuales" title="Restablecer preferencias visuales">
                <RotateCcw size={17} aria-hidden="true" />
            </button>
        </aside>
    )
}
