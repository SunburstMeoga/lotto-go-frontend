const CurrencyModal = ({ isOpen, onClose, selectedCurrency, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-end"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 99999,  // 提高z-index确保在最顶层
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-2xl p-6 animate-slide-up"
        style={{
          backgroundColor: '#1e1e1e',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium text-white">Select Trade Token</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 transition-colors rounded-full"
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 pb-6">
          {[
            { symbol: 'USDT', name: 'Tether USD', balance: '0' },
            { symbol: 'pUSD', name: 'Polygon USD', balance: '144.5' }
          ].map((currency) => (
            <button
              key={currency.symbol}
              onClick={() => onSelect(currency.symbol)}
              className="w-full text-left px-6 py-4 rounded-xl text-lg font-medium transition-all hover:opacity-80 flex items-center justify-between"
              style={{
                backgroundColor: selectedCurrency === currency.symbol ? '#2a2a2a' : '#1e1e1e',
                color: selectedCurrency === currency.symbol ? '#eaae36' : '#ffffff',
                border: selectedCurrency === currency.symbol ? '2px solid #eaae36' : '2px solid #333333'
              }}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-600 mr-3 flex items-center justify-center">
                  <span className="text-sm font-bold">{currency.symbol.charAt(0)}</span>
                </div>
                <span>{currency.symbol}</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">{currency.balance}</span>
                {selectedCurrency === currency.symbol && (
                  <span style={{ color: '#eaae36' }}>✓</span>
                )}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 rounded-xl text-lg font-medium transition-all hover:opacity-80"
          style={{
            backgroundColor: '#333333',
            color: '#8f8f8f',
            border: '2px solid #333333'
          }}
        >
          取消
        </button>
      </div>
    </div>
  );
};

export default CurrencyModal;
