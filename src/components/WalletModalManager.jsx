import { useState, useEffect } from 'react';
import WalletModal from './WalletModal';
import SendModal from './SendModal';
import SelectTokenModal from './SelectTokenModal';
import ChooseProviderModal from './ChooseProviderModal';

const WalletModalManager = ({ isOpen, onClose }) => {
  const [currentModal, setCurrentModal] = useState('wallet'); // 'wallet', 'send', 'activity', 'selectToken', 'chooseProvider'
  const [selectedToken, setSelectedToken] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 平滑切换弹窗的函数
  const smoothTransition = (newModal) => {
    if (isTransitioning) return;

    setIsTransitioning(true);

    // 短暂延迟后切换弹窗
    setTimeout(() => {
      setCurrentModal(newModal);
      setIsTransitioning(false);
    }, 150);
  };

  // 处理弹窗切换
  const handleSendClick = () => {
    smoothTransition('send');
  };

  const handleActivityClick = () => {
    smoothTransition('activity');
  };

  const handleSelectToken = () => {
    smoothTransition('selectToken');
  };

  const handleBuy = () => {
    smoothTransition('chooseProvider');
  };

  const handleTokenSelect = (token) => {
    setSelectedToken(token);
    smoothTransition('send');
  };

  // 返回到钱包主页面
  const handleBackToWallet = () => {
    smoothTransition('wallet');
  };

  // 返回到Send页面
  const handleBackToSend = () => {
    smoothTransition('send');
  };

  // 返回到SelectToken页面
  const handleBackToSelectToken = () => {
    smoothTransition('selectToken');
  };

  // 关闭所有弹窗
  const handleCloseAll = () => {
    setCurrentModal('wallet');
    setSelectedToken(null);
    onClose();
  };

  // 如果不是打开状态，不渲染任何内容
  if (!isOpen) return null;

  return (
    <>
      {/* 钱包主弹窗 */}
      <WalletModal
        isOpen={currentModal === 'wallet'}
        onClose={handleCloseAll}
        onSendClick={handleSendClick}
        onActivityClick={handleActivityClick}
      />

      {/* Send 弹窗 */}
      <SendModal
        isOpen={currentModal === 'send'}
        onClose={handleCloseAll}
        onBack={handleBackToWallet}
        onSelectToken={handleSelectToken}
        selectedToken={selectedToken}
      />

      {/* Activity 弹窗 (暂时使用占位符) */}
      {currentModal === 'activity' && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '15vh',
            paddingLeft: '1rem',
            paddingRight: '1rem'
          }}
          onClick={handleCloseAll}
        >
          <div
            className="send-modal-shadow modal-enter modal-content-transition"
            style={{
              backgroundColor: '#1e1e1e',
              borderRadius: '16px',
              padding: '24px',
              position: 'relative',
              width: '332px',
              maxWidth: '90vw',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleBackToWallet}
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'transparent',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              ←
            </button>
            <button
              onClick={handleCloseAll}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#9D9D9D9E',
                color: '#000000',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>
            <h2 style={{ color: '#ffffff', fontSize: '20px', fontWeight: 'bold', margin: '0 0 16px 0' }}>
              Activity
            </h2>
            <p style={{ color: '#8f8f8f', fontSize: '14px', margin: 0 }}>
              Activity functionality coming soon
            </p>
          </div>
        </div>
      )}

      {/* Select Token 弹窗 */}
      <SelectTokenModal
        isOpen={currentModal === 'selectToken'}
        onClose={handleCloseAll}
        onBack={handleBackToSend}
        onBuy={handleBuy}
        onSelectToken={handleTokenSelect}
      />

      {/* Choose Provider 弹窗 */}
      <ChooseProviderModal
        isOpen={currentModal === 'chooseProvider'}
        onClose={handleCloseAll}
        onBack={handleBackToSelectToken}
      />
    </>
  );
};

export default WalletModalManager;
