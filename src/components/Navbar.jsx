import { useTranslation } from 'react-i18next';
import useScrollDirection from '../hooks/useScrollDirection';
import { useWeb3 } from '../hooks/useWeb3';
import logoImage from '../assets/Logo.png';

const Navbar = ({ onWalletModalOpen }) => {
  // 滚动方向检测
  const { isVisible: isNavbarVisible } = useScrollDirection(30);

  // 国际化
  const { t } = useTranslation();

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
        <div className="flex items-center justify-between h-16 px-4">
          {/* 左侧Logo */}
          <div className="flex items-center">
            <img
              src={logoImage}
              alt="Logo"
              className="h-8"
              onError={(e) => {
                e.target.src = "/vite.svg";
              }}
            />
          </div>

          {/* 右侧钱包连接按钮 */}
          <div className="flex justify-end">
            <div
              onClick={handleWalletClick}
              className="px-3 py-2 rounded-lg text-sm font-normal cursor-pointer transition-all border"
              style={{
                color: 'var(--color-text-primary)',
                borderColor: '#FF6600',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 102, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              {isConnecting ? t('connecting') : account ? formatAddress(account) : t('connectWallet')}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;