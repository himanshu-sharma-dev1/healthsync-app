import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './NotificationBell.css';

const NotificationBell = () => {
    const { t } = useLanguage();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Demo notifications for hackathon
    useEffect(() => {
        const demoNotifications = [
            {
                id: 1,
                type: 'reminder',
                titleKey: 'appointmentReminder',
                title: `⏰ ${t('appointmentReminder')}`,
                message: t('language') === 'hi' ? 'डॉ. स्मिथ के साथ आपका परामर्श 1 घंटे में है' : 'Your consultation with Dr. Smith is in 1 hour',
                time: `5 ${t('minAgo')}`,
                read: false
            },
            {
                id: 2,
                type: 'info',
                titleKey: 'preparationChecklist',
                title: `📋 ${t('preparationChecklist')}`,
                message: t('language') === 'hi' ? 'अपने लक्षण और प्रश्न तैयार रखें' : 'Remember to have your symptoms and questions ready',
                time: `30 ${t('minAgo')}`,
                read: false
            },
            {
                id: 3,
                type: 'success',
                titleKey: 'paymentConfirmed',
                title: `✅ ${t('paymentConfirmed')}`,
                message: t('language') === 'hi' ? '₹500 का भुगतान सफल रहा' : 'Your payment of ₹500 was successful',
                time: `1 ${t('hourAgo')}`,
                read: true
            },
            {
                id: 4,
                type: 'info',
                titleKey: 'prescriptionReady',
                title: `📄 ${t('prescriptionReady')}`,
                message: t('language') === 'hi' ? 'आपका प्रिस्क्रिप्शन तैयार है' : 'Your prescription from the last consultation is ready',
                time: `2 ${t('hourAgo')}`,
                read: true
            }
        ];

        setNotifications(demoNotifications);
        setUnreadCount(demoNotifications.filter(n => !n.read).length);
    }, [t]);

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
                aria-label={t('notifications')}
            >
                🔔
                {unreadCount > 0 && (
                    <span className="badge">{unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="dropdown-header">
                        <h4>{t('notifications')}</h4>
                        {notifications.length > 0 && (
                            <div className="header-actions">
                                <button onClick={markAllAsRead}>{t('markAllRead')}</button>
                                <button onClick={clearAll}>{t('clearAll')}</button>
                            </div>
                        )}
                    </div>

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="empty-state">
                                <span>🔕</span>
                                <p>{t('notifications')}</p>
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

