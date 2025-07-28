import useScrollDirection from '../hooks/useScrollDirection';
import { useWeb3 } from '../hooks/useWeb3';

const Navbar = ({ onWalletModalOpen }) => {
  // 滚动方向检测
  const { isVisible: isNavbarVisible } = useScrollDirection(30);

  // Web3钱包功能
  const {
    account,
    isConnecting,
    connectWallet
  } = useWeb3();

  // 格式化钱包地址显示
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleWalletClick = async () => {
    if (account) {
      // 如果已连接，打开钱包弹窗
      onWalletModalOpen();
    } else {
      // 如果未连接，连接钱包
      await connectWallet();
    }
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
      <div className="mobile-container">
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
                e.target.style.backgroundColor = 'rgba(255, 102, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              {isConnecting ? '连接中...' : account ? formatAddress(account) : '连接钱包'}
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
                e.target.style.backgroundColor = 'rgba(255, 102, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              {isConnecting ? '连接中...' : account ? formatAddress(account) : '连接钱包'}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
