import { useState, useEffect } from 'react';
import './NotificationBell.css';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Demo notifications for hackathon
    useEffect(() => {
        const demoNotifications = [
            {
                id: 1,
                type: 'reminder',
                title: '⏰ Appointment Reminder',
                message: 'Your consultation with Dr. Smith is in 1 hour',
                time: '5 min ago',
                read: false
            },
            {
                id: 2,
                type: 'info',
                title: '📋 Preparation Checklist',
                message: 'Remember to have your symptoms and questions ready',
                time: '30 min ago',
                read: false
            },
            {
                id: 3,
                type: 'success',
                title: '✅ Payment Confirmed',
                message: 'Your payment of ₹500 was successful',
                time: '1 hour ago',
                read: true
            },
            {
                id: 4,
                type: 'info',
                title: '📄 Prescription Ready',
                message: 'Your prescription from the last consultation is ready',
                time: '2 hours ago',
                read: true
            }
        ];

        setNotifications(demoNotifications);
        setUnreadCount(demoNotifications.filter(n => !n.read).length);
    }, []);

    const markAsRead = (id) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const clearAll = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    return (
        <div className="notification-bell">
            <button
                className="bell-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                🔔
                {unreadCount > 0 && (
                    <span className="badge">{unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="dropdown-header">
                        <h4>Notifications</h4>
                        {notifications.length > 0 && (
                            <div className="header-actions">
                                <button onClick={markAllAsRead}>Mark all read</button>
                                <button onClick={clearAll}>Clear all</button>
                            </div>
                        )}
                    </div>

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="empty-state">
                                <span>🔕</span>
                                <p>No notifications</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    className={`notification-item ${notif.type} ${!notif.read ? 'unread' : ''}`}
                                    onClick={() => markAsRead(notif.id)}
                                >
                                    <div className="notif-content">
                                        <h5>{notif.title}</h5>
                                        <p>{notif.message}</p>
                                        <span className="notif-time">{notif.time}</span>
                                    </div>
                                    {!notif.read && <span className="unread-dot"></span>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
