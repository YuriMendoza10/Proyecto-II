import { useEffect, useState } from 'react'

const STORAGE_KEY = 'optiacademic_accessibility'
const DEFAULTS = { textSize: 100 }

function readPreferences() {
    try {
        return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
    } catch {
        return DEFAULTS
    }
}

export function useAccessibilityPreferences() {
    const [preferences, setPreferences] = useState(readPreferences)

    useEffect(() => {
        const root = document.documentElement
        root.classList.remove('high-contrast')
        root.style.setProperty('--app-text-scale', `${preferences.textSize / 100}`)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
    }, [preferences])

    return {
        ...preferences,
        increaseText: () => setPreferences((current) => ({ ...current, textSize: Math.min(130, current.textSize + 10) })),
        decreaseText: () => setPreferences((current) => ({ ...current, textSize: Math.max(90, current.textSize - 10) })),
        resetPreferences: () => setPreferences(DEFAULTS),
    }
}
