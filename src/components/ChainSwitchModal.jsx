import { useState } from 'react';
import toast from 'react-hot-toast';
import { useWeb3 } from '../hooks/useWeb3';
import GlobalModal from './GlobalModal';
import { px } from '../utils/responsive';

const ChainSwitchModal = ({ isOpen, onClose }) => {
  const { switchToCorrectChain, CHAIN_CONFIG } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);

  const handleSwitchChain = async () => {
    setIsLoading(true);
    try {
      const success = await switchToCorrectChain();
      if (success) {
        toast.success('网络切换成功');
        onClose();
      }
    } catch (error) {
      console.error('切换网络失败:', error);
      toast.error('切换网络失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <GlobalModal 
      isOpen={isOpen} 
      onClose={onClose}
      showCloseButton={false}
      closeOnOverlayClick={false}
    >
      <div
        style={{
          backgroundColor: '#1e1e1e',
          borderRadius: `${px(16)}px`,
          padding: `${px(24)}px`,
          position: 'relative',
          textAlign: 'center'
        }}
      >
        {/* 警告图标 */}
        <div className="flex justify-center mb-4">
          <div
            style={{
              width: `${px(64)}px`,
              height: `${px(64)}px`,
              borderRadius: '50%',
              backgroundColor: '#FF6600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width={px(32)} height={px(32)} fill="white" viewBox="0 0 24 24">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
          </div>
        </div>

        {/* 标题 */}
        <h2 
          className="mb-4 font-bold"
          style={{ 
            color: '#ffffff', 
            fontSize: `${px(20)}px`,
            marginBottom: `${px(16)}px`
          }}
        >
          网络不匹配
        </h2>

        {/* 描述 */}
        <p 
          className="mb-6"
          style={{ 
            color: '#8f8f8f', 
            fontSize: `${px(14)}px`,
            lineHeight: '1.5',
            marginBottom: `${px(24)}px`
          }}
        >
          请切换到 {CHAIN_CONFIG.chainName} 网络以继续使用应用
        </p>

        {/* 按钮组 */}
        <div className="flex space-x-3">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: `${px(12)}px ${px(16)}px`,
              borderRadius: `${px(8)}px`,
              border: '1px solid #4a4a4a',
              backgroundColor: 'transparent',
              color: '#ffffff',
              fontSize: `${px(14)}px`,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            取消
          </button>
          <button
            onClick={handleSwitchChain}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: `${px(12)}px ${px(16)}px`,
              borderRadius: `${px(8)}px`,
              border: 'none',
              backgroundColor: '#FF6600',
              color: '#ffffff',
              fontSize: `${px(14)}px`,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isLoading ? (
              <>
                <svg 
                  width={px(16)} 
                  height={px(16)} 
                  className="animate-spin mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4" 
                    className="opacity-25"
                  />
                  <path 
                    fill="currentColor" 
                    d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
                    className="opacity-75"
                  />
                </svg>
                切换中...
              </>
            ) : (
              '确认切换'
            )}
          </button>
        </div>
      </div>
    </GlobalModal>
  );
};

export default ChainSwitchModal;
