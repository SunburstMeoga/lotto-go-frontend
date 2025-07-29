import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { px } from '../utils/responsive';

// 导入图标
import btcIcon from '../assets/BTC.png';
import usdrIcon from '../assets/USDR.png';
import upIcon from '../assets/up.png';
import downIcon from '../assets/down.png';

const History = () => {
  const { t } = useTranslation();
  const [selectedAsset, setSelectedAsset] = useState('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 模拟交易历史数据
  const [tradeHistory, setTradeHistory] = useState([]);

  // 生成模拟数据
  useEffect(() => {
    const generateMockData = () => {
      const mockTrades = [];
      for (let i = 0; i < 15; i++) {
        const isWin = Math.random() > 0.5;
        const amount = 1; // 固定1 pUSD
        const profit = isWin ? 0.75 : -1; // 盈利0.75或亏损1
        const direction = Math.random() > 0.5 ? 'up' : 'down';
        const buyTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
        const settleTime = new Date(buyTime.getTime() + 60000);

        mockTrades.push({
          id: i + 1,
          direction,
          amount,
          profit,
          isWin,
          buyTime,
          settleTime,
          balanceBefore: 115.280,
          balanceAfter: 115.280 + profit
        });
      }
      return mockTrades;
    };

    setTradeHistory(generateMockData());
  }, []);

  const assetOptions = [
    { value: 'all', label: t('tradingAsset') },
    { value: 'USDT', label: 'USDT' },
    { value: 'USDR', label: 'USDR' }
  ];

  const formatTime = (date) => {
    return date.toLocaleString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/,/g, '');
  };

  return (
    <div className="px-4" style={{ paddingBottom: '80px' }}>
          {/* 标题 */}
          <h1
            className="text-2xl mb-6 pt-4"
            style={{
              color: '#FF6600',
              fontSize: '24px',
              fontWeight: '600'
            }}
          >
            {t('tradeHistory')}
          </h1>

          {/* 资产选择框 */}
          <div className="mb-6 relative inline-block">
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center justify-between px-4 py-2 rounded-full cursor-pointer transition-all duration-200"
              style={{
                backgroundColor: '#3a3a3a',
                minWidth: '140px'
              }}
            >
              <span className="text-white text-sm">
                {assetOptions.find(option => option.value === selectedAsset)?.label}
              </span>
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="#8f8f8f"
                viewBox="0 0 24 24"
                className={`ml-2 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* 下拉选项 */}
            {showDropdown && (
              <div
                className="absolute top-full left-0 mt-1 rounded-lg border z-10 overflow-hidden min-w-full"
                style={{
                  backgroundColor: '#3a3a3a',
                  borderColor: '#555'
                }}
              >
                {assetOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => {
                      setSelectedAsset(option.value);
                      setShowDropdown(false);
                    }}
                    className="px-4 py-2 hover:bg-opacity-80 cursor-pointer transition-colors text-sm"
                    style={{
                      backgroundColor: selectedAsset === option.value ? 'rgba(255, 102, 0, 0.1)' : 'transparent'
                    }}
                  >
                    <span className="text-white">{option.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 交易历史卡片列表 */}
          <div className="space-y-3">
            {tradeHistory.map((trade) => (
              <div
                key={trade.id}
                className="rounded-xl p-4"
                style={{ backgroundColor: '#2a2a2a' }}
              >
                {/* 上半部分 - 币种信息和方向 */}
                <div className="flex items-center justify-between" style={{ marginBottom: px(16) }}>
                  <div className="flex items-center">
                    {/* BTC 图标 */}
                    <img
                      src={btcIcon}
                      alt="BTC"
                      style={{
                        width: px(24),
                        height: px(24),
                        zIndex: 1
                      }}
                    />
                    {/* USDR 图标 - 重叠1/3 */}
                    <img
                      src={usdrIcon}
                      alt="USDR"
                      style={{
                        width: px(24),
                        height: px(24),
                        marginLeft: px(-8), // 重叠约1/3
                        zIndex: 2
                      }}
                    />
                    <div className="ml-2">
                      <span className="text-white font-medium">BTC-USD</span>
                      <span style={{ color: '#9D9D9D' }} className="text-sm"> _ 1m</span>
                    </div>
                  </div>

                  {/* 涨跌图标 */}
                  <div>
                    <img
                      src={trade.direction === 'up' ? upIcon : downIcon}
                      alt={trade.direction}
                      style={{ width: px(22), height: px(22) }}
                    />
                  </div>
                </div>

                {/* 分隔线 */}
                <div
                  style={{
                    height: '0.5px',
                    backgroundColor: '#8A7D6A',
                    opacity: 0.5,
                    marginTop: px(16),
                    marginBottom: px(16)
                  }}
                ></div>

                {/* 下半部分 - 交易信息 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: px(12) }}>
                  {/* 第一行：下注金额和盈亏 */}
                  <div className="flex justify-between items-center">
                    <span className="text-white text-lg font-medium">{trade.amount} pUSD</span>
                    <span
                      className="text-lg font-medium"
                      style={{ color: '#FF6600' }}
                    >
                      {trade.profit > 0 ? '+' : ''}{trade.profit.toFixed(2)} pUSD
                    </span>
                  </div>

                  {/* 第二行：交易前后余额 */}
                  <div className="flex justify-between items-center text-sm">
                    <span style={{ color: '#9D9D9D' }}>{trade.balanceBefore.toFixed(1)}</span>
                    <span style={{ color: '#9D9D9D' }}>{trade.balanceAfter.toFixed(1)}</span>
                  </div>

                  {/* 第三行：买入时间和结算时间 */}
                  <div className="flex justify-between items-center text-sm">
                    <span style={{ color: '#9D9D9D' }}>{formatTime(trade.buyTime)}</span>
                    <span style={{ color: '#9D9D9D' }}>{formatTime(trade.settleTime)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 加载更多按钮 */}
          {isLoading && (
            <div className="mt-6 text-center">
              <div className="text-gray-400">{t('loading')}</div>
            </div>
          )}
    </div>
  );
};

export default History;
