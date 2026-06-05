import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import toast from 'react-hot-toast'

import { notificationService } from '../../services/notificationService'
import NotificationDropdown from './NotificationDropdown'

export default function NotificationBell() {
    const [open, setOpen] = useState(false)
    const [items, setItems] = useState([])
    const [unread, setUnread] = useState(0)

    const refresh = async () => {
        try {
            const [list, count] = await Promise.all([
                notificationService.listMine({ limit: 6 }),
                notificationService.unreadCount(),
            ])
            setItems(list.notifications)
            setUnread(count.unread_count)
        } catch {
            // Do not interrupt navigation when a transient poll fails.
        }
    }

    useEffect(() => {
        Promise.all([
            notificationService.listMine({ limit: 6 }),
            notificationService.unreadCount(),
        ]).then(([list, count]) => {
            setItems(list.notifications)
            setUnread(count.unread_count)
        }).catch(() => {
            // Do not interrupt navigation when the initial poll fails.
        })
        const timer = window.setInterval(refresh, 30000)
        return () => window.clearInterval(timer)
    }, [])

    useEffect(() => {
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') setOpen(false)
        }
        window.addEventListener('keydown', closeOnEscape)
        return () => window.removeEventListener('keydown', closeOnEscape)
    }, [])

    const read = async (item) => {
        if (!item.is_read) await notificationService.markRead(item.id)
        await refresh()
    }

    const readAll = async () => {
        try {
            await notificationService.markAllRead()
            await refresh()
        } catch {
            toast.error('No se pudieron marcar las notificaciones.')
        }
    }

    return <div className="relative">
        <button onClick={() => { setOpen(!open); if (!open) refresh() }} className="relative rounded-xl border border-slate-300 bg-white p-2.5 text-slate-700 hover:text-orange-700" aria-label={`Notificaciones. ${unread} sin leer`} aria-expanded={open} aria-controls="notification-dropdown">
            <Bell size={20} aria-hidden="true" />
            {unread > 0 && <span className="absolute -right-1.5 -top-1.5 min-w-5 rounded-full bg-red-700 px-1.5 py-0.5 text-center text-xs font-bold text-white" aria-hidden="true">{unread > 99 ? '99+' : unread}</span>}
        </button>
        {open && <NotificationDropdown items={items} unreadCount={unread} onReadAll={readAll} onRead={read} />}
    </div>
}
