import { NavLink } from 'react-router-dom'

export default function SidebarItem({ to, icon, label, badge }) {
    return (
        <NavLink
            to={to}
            end
            className={({ isActive }) =>
                [
                    'flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium transition',
                    isActive
                        ? 'bg-orange-600 text-white shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                ].join(' ')
            }
        >
            <span className="flex min-w-0 items-center gap-3">
                <span aria-hidden="true">{icon}</span>
                <span className="truncate">{label}</span>
            </span>
            {badge && <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{badge}</span>}
        </NavLink>
    )
}
