const CurrencyModal = ({ isOpen, onClose, selectedCurrency, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-end"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 9999 }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-2xl p-6 animate-slide-up"
        style={{ backgroundColor: '#1e1e1e' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium text-white">选择货币</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 pb-6">
          {['USDT', 'SDT'].map((currency) => (
            <button
              key={currency}
              onClick={() => onSelect(currency)}
              className="w-full text-left px-6 py-4 rounded-xl text-lg font-medium"
              style={{
                backgroundColor: selectedCurrency === currency ? '#2a2a2a' : '#1e1e1e',
                color: selectedCurrency === currency ? '#eaae36' : '#ffffff',
                border: selectedCurrency === currency ? '2px solid #eaae36' : '2px solid #333333'
              }}
            >
              {currency}
              {selectedCurrency === currency && (
                <span className="float-right" style={{ color: '#eaae36' }}>✓</span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 rounded-xl text-lg font-medium"
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
