import toast from 'react-hot-toast';
import { useWeb3 } from '../hooks/useWeb3';
import GlobalModal from './GlobalModal';
import { px } from '../utils/responsive';

const WalletModal = ({ isOpen, onClose, onSendClick, onActivityClick }) => {
  const {
    account,
    disconnect
  } = useWeb3();

  // 格式化钱包地址显示
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleDisconnect = () => {
    disconnect();
    onClose();
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

  if (!isOpen || !account) return null;

  return (
    <GlobalModal 
      isOpen={isOpen} 
      onClose={onClose}
      showCloseButton={false}
    >
      <div
        style={{
          backgroundColor: '#1e1e1e',
          borderRadius: `${px(16)}px`,
          padding: `${px(24)}px`,
          position: 'relative'
        }}
      >
        {/* 自定义关闭按钮 */}
        <div
          onClick={onClose}
          style={{
            position: 'absolute',
            top: `${px(12)}px`,
            right: `${px(12)}px`,
            width: `${px(32)}px`,
            height: `${px(32)}px`,
            borderRadius: '50%',
            backgroundColor: '#9D9D9D9E',
            color: '#000000',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 1000001,
            fontSize: `${px(18)}px`,
            fontWeight: 'bold'
          }}
        >
          ✕
        </div>

        {/* 钱包头像 */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="rounded-full mb-4 flex items-center justify-center"
            style={{
              backgroundColor: '#eaae36',
              width: `${px(64)}px`,
              height: `${px(64)}px`
            }}
          >
            <svg width={px(32)} height={px(32)} fill="white" viewBox="0 0 24 24">
              <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
            </svg>
          </div>
          
          {/* 钱包地址 */}
          <div 
            className="text-lg font-medium mb-2 cursor-pointer flex items-center"
            style={{ color: '#ffffff', fontSize: `${px(18)}px` }}
            onClick={copyAddress}
          >
            {formatAddress(account)}
            <svg width={px(16)} height={px(16)} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="ml-2">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          
          {/* 余额显示 */}
          <div style={{ color: '#8f8f8f', fontSize: `${px(14)}px` }}>
            0.000 BNB
          </div>
        </div>

        {/* 功能按钮 */}
        <div className="space-y-3">
          <div
            onClick={onSendClick}
            className="w-full flex items-center justify-between p-4 rounded-lg transition-all cursor-pointer"
            style={{ backgroundColor: '#121212' }}
          >
            <div className="flex items-center">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#4f46e5', marginRight: `${px(12)}px`, width: `${px(32)}px`, height: `${px(32)}px` }}
              >
                <svg width={px(16)} height={px(16)} fill="white" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </div>
              <span style={{ color: '#ffffff', fontSize: `${px(16)}px` }}>Send</span>
            </div>
            <svg width={px(16)} height={px(16)} fill="none" stroke="#8f8f8f" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>

          <div
            onClick={onActivityClick}
            className="w-full flex items-center justify-between p-4 rounded-lg transition-all cursor-pointer"
            style={{ backgroundColor: '#121212' }}
          >
            <div className="flex items-center">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#059669', marginRight: `${px(12)}px`, width: `${px(32)}px`, height: `${px(32)}px` }}
              >
                <svg width={px(16)} height={px(16)} fill="white" viewBox="0 0 24 24">
                  <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                </svg>
              </div>
              <span style={{ color: '#ffffff', fontSize: `${px(16)}px` }}>Activity</span>
            </div>
            <svg width={px(16)} height={px(16)} fill="none" stroke="#8f8f8f" viewBox="0 0 24 24">
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
                style={{ backgroundColor: '#dc2626', marginRight: `${px(12)}px`, width: `${px(32)}px`, height: `${px(32)}px` }}
              >
                <svg width={px(16)} height={px(16)} fill="white" viewBox="0 0 24 24">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5z"/>
                </svg>
              </div>
              <span style={{ color: '#ffffff', fontSize: `${px(16)}px` }}>Disconnect</span>
            </div>
          </div>
        </div>
      </div>
    </GlobalModal>
  );
};

export default WalletModal;
