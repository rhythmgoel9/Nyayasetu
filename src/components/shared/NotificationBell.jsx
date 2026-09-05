import { useState, useRef, useEffect } from 'react';
import { Bell, FileSearch, Gavel, Share2, Shield, CheckCircle, X } from 'lucide-react';
import { mockNotifications } from '../../data/mockData';
import { formatRelativeTime } from '../../utils/helpers';
import { useLanguage } from '../../contexts/LanguageContext';

const iconMap = {
  FileSearch,
  Gavel,
  Share2,
  Shield,
  CheckCircle,
};

export default function NotificationBell({ scrolled, isLandingPage }) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const panelRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const typeColors = {
    case_update: 'text-navy bg-navy-100',
    hearing: 'text-saffron-700 bg-saffron-100',
    sharing: 'text-forest bg-forest-100',
    alert: 'text-alert bg-alert-100',
    system: 'text-charcoal-muted bg-gray-100',
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full transition-all duration-200 ${
          scrolled || !isLandingPage
            ? 'text-navy hover:bg-navy-50'
            : 'text-white hover:bg-white/10'
        }`}
        aria-label={`${t('common.notifications')} — ${unreadCount} unread`}
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-alert text-white text-[10px] font-bold rounded-full flex items-center justify-center badge-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-navy-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-navy-50 bg-cream">
            <h3 className="text-sm font-semibold text-charcoal">{t('common.notifications')}</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-navy hover:text-saffron transition-colors font-medium"
                >
                  {t('common.markAllRead')}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-navy-50 text-charcoal-muted"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notif) => {
              const IconComponent = iconMap[notif.icon] || Bell;
              const colorClass = typeColors[notif.type] || typeColors.system;

              return (
                <div
                  key={notif.id}
                  className={`flex gap-3 px-4 py-3 border-b border-navy-50/50 hover:bg-navy-50/30 transition-colors cursor-pointer ${
                    !notif.read ? 'bg-navy-50/50' : ''
                  }`}
                  role="listitem"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notif.read ? 'font-semibold text-charcoal' : 'font-medium text-charcoal-light'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-charcoal-muted mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-[10px] text-charcoal-muted/70 mt-1">{formatRelativeTime(notif.time)}</p>
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-saffron flex-shrink-0 mt-2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
