import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    {
      name: 'Trade',
      path: '/trading',
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    {
      name: 'History',
      path: '/history',
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      name: 'Account',
      path: '/account',
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  const isActive = (path) => location.pathname === path;

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
              color: isActive(item.path) ? '#eaae36' : '#8f8f8f',
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
              marginBottom: '4px',
              color: isActive(item.path) ? '#eaae36' : '#8f8f8f'
            }}>
              {item.icon}
            </div>
            <span style={{
              fontSize: '12px',
              fontWeight: 'normal',
              color: isActive(item.path) ? '#eaae36' : '#8f8f8f'
            }}>{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
