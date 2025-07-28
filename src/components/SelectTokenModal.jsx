import { useState } from 'react';
import GlobalModal from './GlobalModal';
import { px } from '../utils/responsive';

const SelectTokenModal = ({ isOpen, onClose, onBack, onBuy, onSelectToken }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tokens] = useState([]); // 暂时为空数组，表示没有代币

  // 过滤代币
  const filteredTokens = tokens.filter(token =>
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTokenSelect = (token) => {
    onSelectToken(token);
    onClose();
  };

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
          height: `${px(600)}px`,
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
            Select Token
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

        {/* 搜索框 */}
        <div
          style={{
            backgroundColor: '#2a2a2a',
            borderRadius: `${px(12)}px`,
            padding: `${px(12)}px ${px(16)}px`,
            marginBottom: `${px(24)}px`,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <svg 
            width={px(20)} 
            height={px(20)} 
            fill="none" 
            stroke="#8f8f8f" 
            viewBox="0 0 24 24"
            style={{ marginRight: `${px(12)}px` }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Select Token"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: `${px(16)}px`,
              flex: 1,
              '::placeholder': {
                color: '#8f8f8f'
              }
            }}
          />
        </div>

        {/* Your tokens 标题 */}
        <h3 
          style={{ 
            color: '#8f8f8f', 
            fontSize: `${px(16)}px`,
            fontWeight: '500',
            margin: 0,
            marginBottom: `${px(16)}px`
          }}
        >
          Your tokens
        </h3>

        {/* 代币列表或空状态 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {filteredTokens.length > 0 ? (
            // 代币列表
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filteredTokens.map((token, index) => (
                <div
                  key={index}
                  onClick={() => handleTokenSelect(token)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: `${px(12)}px`,
                    borderRadius: `${px(8)}px`,
                    cursor: 'pointer',
                    marginBottom: `${px(8)}px`,
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2a2a2a'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <div
                    style={{
                      width: `${px(40)}px`,
                      height: `${px(40)}px`,
                      borderRadius: '50%',
                      backgroundColor: '#4a4a4a',
                      marginRight: `${px(12)}px`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {token.icon || token.symbol.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#ffffff', fontSize: `${px(16)}px`, fontWeight: '500' }}>
                      {token.symbol}
                    </div>
                    <div style={{ color: '#8f8f8f', fontSize: `${px(14)}px` }}>
                      {token.name}
                    </div>
                  </div>
                  <div style={{ color: '#ffffff', fontSize: `${px(16)}px` }}>
                    {token.balance || '0.00'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // 空状态
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
              {/* 空状态图标 */}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>

              {/* 空状态文本 */}
              <h4 
                style={{ 
                  color: '#ffffff', 
                  fontSize: `${px(18)}px`,
                  fontWeight: '600',
                  margin: 0,
                  marginBottom: `${px(8)}px`
                }}
              >
                No tokens found
              </h4>
              <p 
                style={{ 
                  color: '#8f8f8f', 
                  fontSize: `${px(14)}px`,
                  margin: 0,
                  marginBottom: `${px(24)}px`
                }}
              >
                Your tokens will appear here
              </p>

              {/* Buy 按钮 */}
              <button
                onClick={onBuy}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#FF6600',
                  fontSize: `${px(16)}px`,
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: `${px(8)}px ${px(16)}px`,
                  borderRadius: `${px(8)}px`,
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 102, 0, 0.1)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Buy
              </button>
            </div>
          )}
        </div>
      </div>
    </GlobalModal>
  );
};

export default SelectTokenModal;
