import { Link } from 'react-router-dom'

export default function NotificationDropdown({ items, unreadCount, onReadAll, onRead }) {
    return <div id="notification-dropdown" className="absolute right-0 top-12 z-30 w-96 overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-xl" role="region" aria-label="Notificaciones recientes">
        <div className="flex items-center justify-between border-b p-4">
            <div>
                <p className="font-bold text-slate-900">Notificaciones</p>
                <p className="text-xs text-slate-700">{unreadCount} sin leer</p>
            </div>
            <button onClick={onReadAll} className="text-xs font-semibold text-orange-600 hover:text-orange-700">
                Marcar todas leidas
            </button>
        </div>
        <div className="max-h-80 divide-y overflow-y-auto">
            {items.map((item) => (
                <button key={item.id} onClick={() => onRead(item)} className={`block w-full p-4 text-left hover:bg-slate-50 ${item.is_read ? '' : 'bg-orange-50/50'}`}>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-600">{item.message}</p>
                    <p className="mt-2 text-xs text-slate-600">{new Date(item.created_at).toLocaleString('es-PE')}</p>
                </button>
            ))}
            {!items.length && <p className="p-8 text-center text-sm text-slate-500">No tienes notificaciones.</p>}
        </div>
        <Link to="/notifications" className="block border-t p-3 text-center text-sm font-semibold text-orange-600 hover:bg-orange-50">
            Ver todas
        </Link>
    </div>
}
