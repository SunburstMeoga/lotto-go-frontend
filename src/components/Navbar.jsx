import { useState } from 'react';
import useScrollDirection from '../hooks/useScrollDirection';

const Navbar = () => {
  const [isConnected, setIsConnected] = useState(false);

  // 滚动方向检测
  const { isVisible: isNavbarVisible } = useScrollDirection(30);

  // 模拟钱包地址
  const mockWalletAddress = "0x1234...5678";

  const handleWalletClick = () => {
    setIsConnected(!isConnected);
  };

  return (
    <nav
        className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800"
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          transform: isNavbarVisible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s ease-in-out',
          width: '100%',
          maxWidth: '100vw'
        }}
      >
      <div className="flex justify-between items-center h-16 px-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img
              src="/vite.svg"
              alt="Logo"
              className="w-8 h-8"
            />
            <span className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Binary Options
            </span>
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:flex items-center space-x-4">
            <div
              onClick={handleWalletClick}
              className="px-4 py-2 rounded-lg text-sm font-normal cursor-pointer transition-all border hover:bg-opacity-10"
              style={{
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-accent)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(234, 174, 54, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              {isConnected ? mockWalletAddress : '连接钱包'}
            </div>
          </div>

          {/* 移动端也显示钱包按钮 */}
          <div className="md:hidden">
            <div
              onClick={handleWalletClick}
              className="px-3 py-2 rounded-lg text-sm font-normal cursor-pointer transition-all border"
              style={{
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-accent)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(234, 174, 54, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              {isConnected ? mockWalletAddress : '连接钱包'}
            </div>
          </div>
      </div>
    </nav>
  );
};

export default Navbar;
