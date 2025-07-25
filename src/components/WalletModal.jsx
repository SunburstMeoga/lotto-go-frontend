import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useWeb3 } from '../hooks/useWeb3';

const WalletModal = ({ isOpen, onClose }) => {
  const {
    account,
    isCorrectChain,
    disconnect,
    switchToCorrectChain,
    chainId
  } = useWeb3();

  // 获取当前网络信息
  const getCurrentNetworkInfo = () => {
    try {
      const targetChainId = parseInt(import.meta.env.VITE_CHAIN_ID || '97');
      const currentChainIdDecimal = chainId ? parseInt(chainId) : null;

      if (currentChainIdDecimal === targetChainId) {
        return {
          name: import.meta.env.VITE_CHAIN_NAME || 'BSC Testnet',
          icon: '🟡'
        };
      } else if (currentChainIdDecimal === 1) {
        return {
          name: 'Ethereum',
          icon: '⟠'
        };
      } else if (currentChainIdDecimal === 56 || currentChainIdDecimal === 97) {
        return {
          name: currentChainIdDecimal === 56 ? 'BSC Mainnet' : 'BSC Testnet',
          icon: '🟡'
        };
      } else {
        return {
          name: 'Unknown Network',
          icon: '❓'
        };
      }
    } catch (error) {
      console.error('Error getting network info:', error);
      return {
        name: 'Unknown Network',
        icon: '❓'
      };
    }
  };

  // 格式化钱包地址显示
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  const handleSwitchChain = async () => {
    await switchToCorrectChain();
  };

  const copyAddress = async () => {
    if (account) {
      try {
        await navigator.clipboard.writeText(account);
        toast.success('钱包地址已复制到剪贴板');
      } catch (err) {
        console.error('复制失败:', err);
        toast.error('复制失败');
      }
    }
  };

  // 防止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // 清理函数
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !account) return null;

  return (
    <div
      className="fixed inset-0"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 999999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div
        className="w-full p-6"
        style={{
          backgroundColor: '#1e1e1e',
          maxHeight: '70vh',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 1000000,
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部栏：切换网络按钮和关闭按钮 */}
        <div className="flex justify-between items-center mb-6">
          {!isCorrectChain && (
            <div
              onClick={handleSwitchChain}
              className="flex items-center px-3 py-1 rounded-lg text-sm transition-all"
              style={{
                backgroundColor: '#ff4444',
                color: 'white'
              }}
            >
              <span className="mr-2">{getCurrentNetworkInfo().name}</span>
              <span>{getCurrentNetworkInfo().icon}</span>
            </div>
          )}
          {isCorrectChain && <div></div>}
          
          <div
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#333333',
              color: '#ffffff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            ✕
          </div>
        </div>

        {/* 钱包头像 */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="rounded-full mb-4 flex items-center justify-center"
            style={{
              backgroundColor: '#eaae36',
              width: '64px',
              height: '64px'
            }}
          >
            <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
              <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
            </svg>
          </div>
          
          {/* 钱包地址 */}
          <div 
            className="text-lg font-medium mb-2 cursor-pointer flex items-center"
            style={{ color: '#ffffff' }}
            onClick={copyAddress}
          >
            {formatAddress(account)}
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="ml-2">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          
          {/* 余额显示 */}
          <div className="text-sm" style={{ color: '#8f8f8f' }}>
            0.000 BNB
          </div>
        </div>

        {/* 功能按钮 */}
        <div className="space-y-3">
          <div
            className="w-full flex items-center justify-between p-4 rounded-lg transition-all cursor-pointer"
            style={{ backgroundColor: '#121212' }}
          >
            <div className="flex items-center">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#4f46e5', marginRight: '12px' }}
              >
                <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </div>
              <span style={{ color: '#ffffff' }}>Send</span>
            </div>
            <svg width="16" height="16" fill="none" stroke="#8f8f8f" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>

          <div
            className="w-full flex items-center justify-between p-4 rounded-lg transition-all cursor-pointer"
            style={{ backgroundColor: '#121212' }}
          >
            <div className="flex items-center">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#059669', marginRight: '12px' }}
              >
                <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                  <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                </svg>
              </div>
              <span style={{ color: '#ffffff' }}>Activity</span>
            </div>
            <svg width="16" height="16" fill="none" stroke="#8f8f8f" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>

          <div
            onClick={handleDisconnect}
            className="w-full flex items-center justify-between p-4 rounded-lg transition-all cursor-pointer"
            style={{ backgroundColor: '#121212' }}
          >
            <div className="flex items-center">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#dc2626', marginRight: '12px' }}
              >
                <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5z"/>
                </svg>
              </div>
              <span style={{ color: '#ffffff' }}>Disconnect</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
