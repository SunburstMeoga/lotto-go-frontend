import GlobalModal from './GlobalModal';
import { px } from '../utils/responsive';

const DailyClaimModal = ({ isOpen, onClose }) => {
  const handleClaimNow = () => {
    // 这里可以添加实际的领取逻辑
    console.log('Claiming daily pUSD...');
    onClose();
  };

  return (
    <GlobalModal isOpen={isOpen} onClose={onClose}>
      <div
        style={{
          backgroundColor: '#FF6600',
          borderRadius: `${px(16)}px`,
          padding: `${px(32)}px ${px(24)}px`,
          textAlign: 'center',
          position: 'relative'
        }}
      >
        {/* 图片占位符 */}
        <div
          style={{
            width: `${px(96)}px`,
            height: `${px(96)}px`,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: `${px(12)}px`,
            margin: `0 auto ${px(24)}px auto`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${px(32)}px`
          }}
        >
          🎁
        </div>

        {/* 标题 */}
        <h2
          style={{
            color: '#FFFFFF',
            fontSize: `${px(24)}px`,
            fontWeight: 'bold',
            marginBottom: `${px(16)}px`,
            lineHeight: '1.2'
          }}
        >
          Claim Your Daily pUSD
        </h2>

        {/* 文案 */}
        <p
          style={{
            color: '#FFFFFF',
            fontSize: `${px(16)}px`,
            fontWeight: 'normal',
            marginBottom: `${px(32)}px`,
            lineHeight: '1.4'
          }}
        >
          If you missed the modal, visit your Account page to claim it.
        </p>

        {/* 按钮 */}
        <div
          onClick={handleClaimNow}
          style={{
            backgroundColor: '#000000',
            color: '#FFFFFF',
            padding: `${px(16)}px ${px(32)}px`,
            borderRadius: `${px(12)}px`,
            fontSize: `${px(18)}px`,
            fontWeight: 'normal',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: 'none',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#333333';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#000000';
          }}
        >
          Claim Now
        </div>
      </div>
    </GlobalModal>
  );
};

export default DailyClaimModal;
