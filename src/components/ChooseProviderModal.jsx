import GlobalModal from './GlobalModal';
import { px } from '../utils/responsive';

const ChooseProviderModal = ({ isOpen, onClose, onBack }) => {
  if (!isOpen) return null;

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
    >
      <div
        className="send-modal-shadow modal-enter modal-content-transition modal-height-transition"
        style={{
          backgroundColor: '#1e1e1e',
          borderRadius: `${px(16)}px`,
          padding: `${px(24)}px`,
          position: 'relative',
          height: `${px(400)}px`,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          {/* 返回按钮 */}
          <div
            onClick={onBack}
            style={{
              width: `${px(32)}px`,
              height: `${px(32)}px`,
              borderRadius: '50%',
              backgroundColor: 'transparent',
              color: '#ffffff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: `${px(18)}px`
            }}
          >
            <svg width={px(20)} height={px(20)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>

          {/* 标题 */}
          <h2 
            style={{ 
              color: '#ffffff', 
              fontSize: `${px(20)}px`,
              fontWeight: 'bold',
              margin: 0
            }}
          >
            Choose Provider
          </h2>

          {/* 关闭按钮 */}
          <div
            onClick={onClose}
            style={{
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
              fontSize: `${px(18)}px`,
              fontWeight: 'bold'
            }}
          >
            ✕
          </div>
        </div>

        {/* 占位内容 */}
        <div 
          style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: `${px(80)}px`,
              height: `${px(80)}px`,
              borderRadius: `${px(12)}px`,
              backgroundColor: '#2a2a2a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: `${px(24)}px`
            }}
          >
            <svg width={px(40)} height={px(40)} fill="none" stroke="#8f8f8f" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </div>

          <h3 
            style={{ 
              color: '#ffffff', 
              fontSize: `${px(18)}px`,
              fontWeight: '600',
              margin: 0,
              marginBottom: `${px(8)}px`
            }}
          >
            Choose Provider
          </h3>
          <p 
            style={{ 
              color: '#8f8f8f', 
              fontSize: `${px(14)}px`,
              margin: 0
            }}
          >
            Provider selection functionality coming soon
          </p>
        </div>
      </div>
    </GlobalModal>
  );
};

export default ChooseProviderModal;
