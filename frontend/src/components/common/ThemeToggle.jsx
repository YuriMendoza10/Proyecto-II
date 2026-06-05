import { Moon, Sun } from 'lucide-react'

import { useTheme } from '../../hooks/useTheme'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const dark = theme === 'dark'

  return (
    <button
      aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-pressed={dark}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
      onClick={toggleTheme}
      title={dark ? 'Usar modo claro' : 'Usar modo oscuro'}
      type="button"
    >
      {dark ? <Sun aria-hidden="true" size={17} /> : <Moon aria-hidden="true" size={17} />}
      <span>{dark ? 'Claro' : 'Oscuro'}</span>
    </button>
  )
}
