import { ChevronDown } from 'lucide-react'

export default function SidebarSection({ title, icon, open, active, onToggle, children }) {
    const contentId = `sidebar-section-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    return (
        <section className="space-y-1">
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                aria-controls={contentId}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-xs font-bold uppercase tracking-wide transition ${active ? 'bg-slate-900 text-orange-200' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
            >
                <span className="flex items-center gap-2">
                    <span aria-hidden="true">{icon}</span>
                    {title}
                </span>
                <ChevronDown aria-hidden="true" size={16} className={`transition ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && <div id={contentId} className="space-y-1 pl-2">{children}</div>}
        </section>
    )
}
