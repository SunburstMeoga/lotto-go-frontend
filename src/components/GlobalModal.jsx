import { useEffect } from 'react';
import { px } from '../utils/responsive';

const GlobalModal = ({ 
  isOpen, 
  onClose, 
  children, 
  className = '',
  showCloseButton = true,
  closeOnOverlayClick = true 
}) => {
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

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0"
      style={{
        zIndex: 999999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        // 毛玻璃遮罩层效果
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
      onClick={handleOverlayClick}
    >
      <div
        className={`relative ${className}`}
        style={{
          position: 'relative',
          zIndex: 1000000,
          width: `${px(332)}px`,
          maxWidth: '90vw'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        {showCloseButton && (
          <div
            onClick={onClose}
            style={{
              position: 'absolute',
              top: `${px(12)}px`,
              right: `${px(12)}px`,
              width: `${px(32)}px`,
              height: `${px(32)}px`,
              borderRadius: '50%',
              backgroundColor: '#D23800',
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
        )}
        
        {/* 弹窗内容 */}
        {children}
      </div>
    </div>
  );
};

export default GlobalModal;
