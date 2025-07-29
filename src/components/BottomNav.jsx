import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// 导入图标
import tradeIcon from '../assets/trade.png';
import tradeActiveIcon from '../assets/trade-active.png';
import historyIcon from '../assets/history.png';
import historyActiveIcon from '../assets/history-active.png';
import accountIcon from '../assets/account.png';
import accountActiveIcon from '../assets/account-active.png';

const BottomNav = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    {
      name: t('trade'),
      path: '/trading',
      icon: tradeIcon,
      activeIcon: tradeActiveIcon
    },
    {
      name: t('history'),
      path: '/history',
      icon: historyIcon,
      activeIcon: historyActiveIcon
    },
    {
      name: t('account'),
      path: '/account',
      icon: accountIcon,
      activeIcon: accountActiveIcon
    }
  ];

  const isActive = (path) => {
    // 如果是根路径或trading路径，都认为是trading页面激活
    if (path === '/trading') {
      return location.pathname === '/' || location.pathname === '/trading';
    }
    return location.pathname === path;
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1e1e1e',  // 恢复深灰背景
        height: '64px',
        zIndex: 9999,
        borderTop: '1px solid #333333',  // 恢复正常边框
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.3)'  // 添加阴影效果
      }}
    >
      <div className="mobile-container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: '100%',
          padding: '0 16px'
        }}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 12px',
              color: isActive(item.path) ? '#FF6600' : '#8f8f8f',
              textDecoration: 'none',
              minWidth: '60px',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.path)) {
                const iconDiv = e.currentTarget.querySelector('div');
                const span = e.currentTarget.querySelector('span');
                if (iconDiv) iconDiv.style.color = '#ffffff';
                if (span) span.style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.path)) {
                const iconDiv = e.currentTarget.querySelector('div');
                const span = e.currentTarget.querySelector('span');
                if (iconDiv) iconDiv.style.color = '#8f8f8f';
                if (span) span.style.color = '#8f8f8f';
              }
            }}
          >
            <div style={{
              marginBottom: '4px'
            }}>
              <img
                src={isActive(item.path) ? item.activeIcon : item.icon}
                alt={item.name}
                width="24"
                height="24"
                style={{ filter: 'brightness(1)' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <span style={{
              fontSize: '12px',
              fontWeight: 'normal',
              color: isActive(item.path) ? '#FF6600' : '#8f8f8f'
            }}>{item.name}</span>
          </Link>
        ))}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
