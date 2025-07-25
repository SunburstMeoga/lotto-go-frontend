import { useState, useEffect, useRef } from 'react';
import TradingChart from '../components/TradingChart';
import CurrencyModal from '../components/CurrencyModal';
import { usePriceContext } from '../contexts/PriceContext';

const Trading = () => {
  const { currentPrice, updatePrice } = usePriceContext();
  const [tradeAmount, setTradeAmount] = useState(1);
  const [payout] = useState(1.75);
  const [chartData, setChartData] = useState([]);
  const [activeTrades, setActiveTrades] = useState([]);
  const [balance, setBalance] = useState(1000); // 初始余额1000
  const [selectedCurrency, setSelectedCurrency] = useState('USDT');
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showTokenList, setShowTokenList] = useState(true); // 默认显示token列表
  const [selectedToken, setSelectedToken] = useState(null);
  const [realTimeTokens, setRealTimeTokens] = useState({}); // 存储实时价格数据
  const [chartType, setChartType] = useState('line'); // 图表类型：'candlestick' 或 'line' - 默认为折线图
  const currentPriceRef = useRef(currentPrice); // 用于在定时器中访问最新价格
  const updatePriceRef = useRef(updatePrice); // 用于在定时器中访问最新的updatePrice函数

  // Token 列表数据
  const tokenList = [
    {
      id: 'BTC',
      name: 'BTC-USD',
      icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png',
      price: 115773.26,
      change: 0,
      changePercent: 0,
      payout: 175
    },
    {
      id: 'ETH',
      name: 'ETH-USD',
      icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
      price: 3715.3,
      change: 0,
      changePercent: 0,
      payout: 175
    },
    {
      id: 'BNB',
      name: 'BNB-USD',
      icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',
      price: 770.479,
      change: -1.54,
      changePercent: -0.2,
      payout: 175
    },
    {
      id: 'SOL',
      name: 'SOL-USD',
      icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png',
      price: 180.421,
      change: -0.72,
      changePercent: -0.4,
      payout: 175
    },
    {
      id: 'TRUMP',
      name: 'TRUMP-USD',
      icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png', // 使用BTC图标作为占位符
      price: 9.9205,
      change: -0.04,
      changePercent: -0.4,
      payout: 175
    }
  ];

  // 生成模拟K线数据 - 2分钟跨度
  const generateMockData = (basePriceOverride = null) => {
    const data = [];
    // 如果选择了token，使用token的价格作为基础价格
    let basePrice = basePriceOverride || currentPrice || 118735;
    const now = Date.now();

    // 根据价格大小调整波动幅度
    const priceScale = basePrice / 100000; // 基于10万作为基准
    const volatilityMultiplier = Math.max(0.1, Math.min(2, priceScale)); // 限制在0.1-2倍之间

    // 改为60个数据点，每个数据点间隔2秒，总跨度2分钟
    for (let i = 60; i >= 0; i--) {
      const time = now - i * 2000; // 每2秒一个数据点
      const open = basePrice + (Math.random() - 0.5) * 800 * volatilityMultiplier; // 根据价格调整波动幅度
      const high = open + Math.random() * 400 * volatilityMultiplier; // 增加高点变化
      const low = open - Math.random() * 400 * volatilityMultiplier; // 增加低点变化
      const close = open + (Math.random() - 0.5) * 600 * volatilityMultiplier; // 增加收盘价变化

      data.push({
        time,
        open,
        high,
        low,
        close
      });

      basePrice = close;
    }

    return data;
  };

  // 更新refs
  useEffect(() => {
    currentPriceRef.current = currentPrice;
    updatePriceRef.current = updatePrice;
  }, [currentPrice, updatePrice]);

  // 初始化图表数据
  useEffect(() => {
    // 只在组件挂载时初始化一次
    if (chartData.length === 0) {
      const mockData = generateMockData();
      setChartData(mockData);
      const lastPrice = mockData[mockData.length - 1].close;

      // 计算价格变化
      const prevPrice = mockData[mockData.length - 2]?.close || lastPrice;
      const change = lastPrice - prevPrice;
      const changePercent = (change / prevPrice) * 100;

      // 更新价格上下文
      updatePriceRef.current(lastPrice, change, changePercent);
      currentPriceRef.current = lastPrice; // 初始化ref

      // 初始化实时token数据
      const initialTokenData = {};
      tokenList.forEach(token => {
        initialTokenData[token.id] = {
          price: token.price,
          changePercent: token.changePercent
        };
      });
      setRealTimeTokens(initialTokenData);
    }

    // 模拟实时数据更新 - 每1秒更新价格，与K线数据同步
    const interval = setInterval(() => {
      const prevPrice = currentPriceRef.current;
      const volatility = 50; // 增加波动性，让价格变化更明显
      const newPrice = prevPrice + (Math.random() - 0.5) * volatility;
      const finalPrice = Math.max(1000, newPrice); // 确保价格不低于1000

      // 更新ref
      currentPriceRef.current = finalPrice;

      // 更新价格变化
      const change = finalPrice - prevPrice;
      const changePercent = (change / prevPrice) * 100;

      // 更新价格上下文
      updatePriceRef.current(finalPrice, change, changePercent);
    }, 1000); // 改为每1秒更新价格，与K线数据同步

    // 更新所有token的实时价格 - 每2秒更新一次
    const tokenInterval = setInterval(() => {
      setRealTimeTokens(prev => {
        const updated = { ...prev };
        tokenList.forEach(token => {
          const currentData = prev[token.id] || { price: token.price, changePercent: token.changePercent };
          const volatility = token.price * 0.01; // 增加到1% 的波动性，让变化更明显
          const priceChange = (Math.random() - 0.5) * volatility;
          const newPrice = Math.max(0.01, currentData.price + priceChange);
          const changePercent = ((newPrice - token.price) / token.price) * 100;

          updated[token.id] = {
            price: newPrice,
            changePercent: changePercent
          };

          // 如果当前选中的是这个token，同时更新currentPriceRef
          if (selectedToken && selectedToken.id === token.id) {
            currentPriceRef.current = newPrice;
            // 同时更新价格上下文
            const change = newPrice - currentData.price;
            const changePercentForContext = (change / currentData.price) * 100;
            updatePriceRef.current(newPrice, change, changePercentForContext);
          }
        });
        return updated;
      });
    }, 1000); // 每1秒更新一次

    // 每1秒更新一次K线数据
    const candleInterval = setInterval(() => {
      setChartData(prevData => {
        const lastData = prevData[prevData.length - 1];

        // 获取当前应该显示的价格（与价格信息栏保持一致）
        let currentPriceValue;
        if (selectedToken) {
          // 如果选择了token，使用token的实时价格
          currentPriceValue = realTimeTokens[selectedToken.id]?.price || selectedToken.price;
        } else {
          // 如果没有选择token，使用默认价格
          currentPriceValue = currentPriceRef.current;
        }

        // 根据当前价格调整波动幅度
        const priceScale = currentPriceValue / 100000; // 基于10万作为基准
        const volatilityMultiplier = Math.max(0.1, Math.min(2, priceScale)); // 限制在0.1-2倍之间

        const newCandle = {
          time: Date.now(),
          open: lastData.close,
          high: Math.max(lastData.close, currentPriceValue) + Math.random() * 100 * volatilityMultiplier, // 根据价格调整波动
          low: Math.min(lastData.close, currentPriceValue) - Math.random() * 100 * volatilityMultiplier, // 根据价格调整波动
          close: currentPriceValue
        };

        // 保持最近60个数据点（2分钟数据）
        const newData = [...prevData, newCandle];
        return newData.length > 60 ? newData.slice(-60) : newData;
      });
    }, 1000); // 1秒更新一次

    return () => {
      clearInterval(interval);
      clearInterval(candleInterval);
      clearInterval(tokenInterval);
    };
  }, []); // 移除所有依赖，只在组件挂载时执行一次

  // 管理活跃交易
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTrades(prevTrades => {
        return prevTrades.map(trade => {
          const elapsed = Date.now() - trade.startTime;
          if (elapsed >= 60000 && !trade.settled) {
            // 1分钟到了，结算交易
            const isWin = trade.direction === 'up'
              ? currentPrice > trade.entryPrice
              : currentPrice < trade.entryPrice;

            const profit = isWin ? trade.amount * payout : -trade.amount;
            setBalance(prev => prev + profit);

            return { ...trade, settled: true, result: isWin ? 'win' : 'loss', profit };
          }
          return trade;
        }).filter(trade => Date.now() - trade.startTime < 120000); // 2分钟后移除
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPrice, payout]);

  const handleTrade = (direction) => {
    if (tradeAmount <= 0) {
      alert('请输入有效的交易金额');
      return;
    }

    if (balance < tradeAmount) {
      alert('余额不足');
      return;
    }

    // 创建新交易 - 使用与价格信息栏一致的价格
    let entryPrice;
    if (selectedToken) {
      // 如果选择了token，使用token的实时价格
      entryPrice = realTimeTokens[selectedToken.id]?.price || selectedToken.price;
    } else {
      // 如果没有选择token，使用当前价格
      entryPrice = currentPriceRef.current;
    }

    const newTrade = {
      id: Date.now(),
      direction,
      amount: tradeAmount,
      entryPrice: entryPrice,
      startTime: Date.now(),
      settled: false
    };

    setActiveTrades(prev => [...prev, newTrade]);
    setBalance(prev => prev - tradeAmount); // 扣除交易金额

    // 简单的成功提示
    const directionText = direction === 'up' ? '看涨' : '看跌';
    alert(`${directionText} 交易已提交！\n金额: $${tradeAmount}\n入场价格: $${entryPrice.toFixed(1)}\n结算时间: 1分钟`);
  };

  // 选择 token 处理函数
  const handleTokenSelect = (token) => {
    setSelectedToken(token);
    setShowTokenList(false);

    // 重新生成基于该token价格的K线数据
    const tokenPrice = realTimeTokens[token.id]?.price || token.price;
    const newChartData = generateMockData(tokenPrice);
    setChartData(newChartData);

    // 立即更新currentPriceRef为选中token的价格，确保同步
    currentPriceRef.current = tokenPrice;

    // 更新价格上下文
    const tokenData = realTimeTokens[token.id] || { price: token.price, changePercent: token.changePercent };
    const change = tokenData.price - token.price;
    updatePriceRef.current(tokenPrice, change, tokenData.changePercent);
  };

  // 返回 token 列表
  const handleBackToTokenList = () => {
    setShowTokenList(true);
    setSelectedToken(null);

    // 重新生成默认的K线数据
    const newChartData = generateMockData();
    setChartData(newChartData);

    // 重置为默认价格
    const defaultPrice = newChartData[newChartData.length - 1].close;
    currentPriceRef.current = defaultPrice;
    updatePriceRef.current(defaultPrice, 0, 0);
  };

  // 渲染 token 列表
  const renderTokenList = () => (
    <div className="space-y-3 p-4">
      <h2 className="text-2xl font-bold text-white mb-6">Markets</h2>
      {tokenList.map((token) => (
        <div
          key={token.id}
          onClick={() => handleTokenSelect(token)}
          className="flex items-center justify-between p-4 rounded-lg cursor-pointer hover:bg-opacity-80 transition-all"
          style={{ backgroundColor: 'var(--color-bg-secondary)' }}
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0" style={{ marginRight: '16px' }}>
              <img
                src={token.icon}
                alt={token.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png';
                }}
              />
            </div>
            <div className="flex flex-col justify-center" style={{ height: '40px' }}>
              <div className="text-white font-medium text-lg leading-tight">{token.name}</div>
              <div className="text-xs leading-tight" style={{ color: '#8f8f8f' }}>Payout: {token.payout}%</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {(() => {
              const realTimeData = realTimeTokens[token.id] || { price: token.price, changePercent: token.changePercent };
              return (
                <>
                  <div className="text-white font-medium text-lg" style={{ textAlign: 'right' }}>
                    {realTimeData.price.toLocaleString(undefined, {
                      minimumFractionDigits: token.price < 1 ? 4 : 2,
                      maximumFractionDigits: token.price < 1 ? 4 : 2
                    })}
                  </div>
                  <div className="text-sm" style={{ textAlign: 'right' }}>
                    {realTimeData.changePercent !== 0 ? (
                      <span style={{
                        color: realTimeData.changePercent > 0 ? '#10b981' : '#ef4444'
                      }}>
                        {realTimeData.changePercent > 0 ? '▲' : '▼'} {Math.abs(realTimeData.changePercent).toFixed(2)}%
                      </span>
                    ) : (
                      <span style={{ color: '#8f8f8f' }}>0%</span>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen text-white overflow-x-hidden w-full" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {/* 主要内容区域 - 添加顶部边距避免被navbar挡住 */}
      <div className="mobile-container" style={{ paddingTop: '64px' }}>

        {/* 如果显示 token 列表 */}
        {showTokenList ? (
          renderTokenList()
        ) : (
          <>
            {/* 交易页面内容 */}
        {/* 价格信息栏 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 w-full" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          <div className="flex items-center">
            {!showTokenList && (
              <div
                onClick={handleBackToTokenList}
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors hover:opacity-80"
                style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'white', fontSize: '16px', marginRight: '12px' }}
              >
                ←
              </div>
            )}
            {selectedToken && (
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0" style={{ marginRight: '12px' }}>
                  <img
                    src={selectedToken.icon}
                    alt={selectedToken.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png';
                    }}
                  />
                </div>
                <div className="flex flex-col justify-center" style={{ height: '32px' }}>
                  <div className="text-white font-medium leading-tight">{selectedToken.name}</div>
                  <div className="leading-tight" style={{ color: '#8f8f8f', fontSize: '10px' }}>Binary Options</div>
                </div>
              </div>
            )}
          </div>

          {selectedToken && (
            <div style={{ textAlign: 'right' }}>
              {(() => {
                const realTimeData = realTimeTokens[selectedToken.id] || { price: selectedToken.price, changePercent: selectedToken.changePercent };
                return (
                  <>
                    <div className="text-2xl font-normal" style={{ textAlign: 'right' }}>
                      {realTimeData.price.toLocaleString(undefined, {
                        minimumFractionDigits: selectedToken.price < 1 ? 4 : 2,
                        maximumFractionDigits: selectedToken.price < 1 ? 4 : 2
                      })}
                    </div>
                    <div className="text-sm" style={{ textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      {realTimeData.changePercent !== 0 ? (
                        <span style={{
                          color: realTimeData.changePercent > 0 ? '#10b981' : '#ef4444'
                        }}>
                          {realTimeData.changePercent > 0 ? '▲' : '▼'} {Math.abs(realTimeData.changePercent).toFixed(2)}%
                        </span>
                      ) : (
                        <span style={{ color: '#8f8f8f' }}>0%</span>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{
                            backgroundColor: realTimeData.changePercent > 0 ? '#10b981' :
                                           realTimeData.changePercent < 0 ? '#ef4444' : '#8f8f8f'
                          }}
                        ></div>
                        <span className="text-xs" style={{ color: '#8f8f8f' }}>实时</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>

      {/* 主要内容区域 */}
      <div>
        {/* 图表区域 */}
        <div className="h-96 relative w-full overflow-hidden">
          <TradingChart
            data={chartData}
            currentPrice={selectedToken ? (realTimeTokens[selectedToken.id]?.price || selectedToken.price) : currentPrice}
            activeTrades={activeTrades}
            chartType={chartType}
          />
        </div>

        {/* 图表类型切换按钮 - 暂时隐藏，只显示折线图 */}
        {/*
        <div className="flex justify-center py-4 border-b" style={{
          backgroundColor: 'var(--color-bg-primary)',
          borderColor: 'var(--color-border)'
        }}>
          <div className="flex rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
            <div
              onClick={() => setChartType('candlestick')}
              className={`px-4 py-2 text-sm font-medium transition-all rounded-r-lg ${
                chartType === 'candlestick'
                  ? 'text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
              style={{
                backgroundColor: chartType === 'candlestick' ? '#eaae36' : 'transparent'
              }}
            >
              K线图
            </div>
            <div
              onClick={() => setChartType('line')}
              className={`px-4 py-2 text-sm font-medium transition-all rounded-l-lg ${
                chartType === 'line'
                  ? 'text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
              style={{
                backgroundColor: chartType === 'line' ? '#eaae36' : 'transparent'
              }}
            >
              折线图
            </div>
          </div>
        </div>
        */}

        {/* 底部交易面板 */}
        <div className="border-t p-4 w-full" style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderColor: 'var(--color-border)',
          paddingBottom: '80px'  // 为底部栏留出空间
        }}>
          <div className="w-full space-y-4">
            {/* 交易金额 */}
            <div>
              <div className="text-gray-400 text-sm mb-2">Trade Amount</div>
              <div className="flex gap-2 w-full justify-between">
                <input
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(Number(e.target.value))}
                  className="flex-1 text-white text-2xl font-normal px-4 py-3 rounded-lg border focus:outline-none min-w-0"
                  style={{
                    backgroundColor: 'var(--color-input-bg)',
                    borderColor: 'var(--color-border)'
                  }}
                  min="1"
                />
                <div
                  onClick={() => setShowCurrencyModal(true)}
                  className="flex items-center px-4 py-3 rounded-lg border cursor-pointer hover:border-gray-600 transition-colors flex-shrink-0"
                  style={{
                    backgroundColor: 'var(--color-input-bg)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  <span className="text-white font-medium text-lg">{selectedCurrency}</span>
                  <svg width="16" height="16" fill="none" stroke="#8f8f8f" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="ml-2">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* 金额滑块 */}
              <div className="mt-6 mb-4">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(Number(e.target.value))}
                  className="w-full rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    height: '10px',
                    background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${tradeAmount}%, var(--color-slider-bg) ${tradeAmount}%, var(--color-slider-bg) 100%)`
                  }}
                />
                <div className="flex justify-between text-xs mt-2" style={{ color: '#8f8f8f' }}>
                  <span>1</span>
                  <span>100</span>
                </div>
              </div>
            </div>

            {/* 余额显示 */}
            <div className="flex justify-between items-center text-sm">
              <span style={{ color: '#8f8f8f' }}>Balance: {balance.toFixed(2)}</span>
              <span style={{ color: '#8f8f8f' }}>Payout: {payout}</span>
            </div>

            {/* 交易按钮 */}
            <div className="flex justify-between gap-3 w-full">
              <div
                onClick={() => handleTrade('up')}
                className="font-normal py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-white"
                style={{ backgroundColor: '#10b981', width: '180px' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
              >
                <svg width="20" height="20" fill="none" stroke="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
                <span>Up</span>
              </div>

              <div className="flex flex-col items-center justify-center px-4">
                <div className="text-gray-400 text-xs">1m</div>
                <svg width="24" height="24" fill="none" stroke="#8f8f8f" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <div
                onClick={() => handleTrade('down')}
                className="font-normal py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-white"
                style={{ backgroundColor: '#ef4444', width: '180px' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
              >
                <svg width="20" height="20" fill="none" stroke="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
                </svg>
                <span>Down</span>
              </div>
            </div>
          </div>
        </div>
      </div>

            {/* 货币选择弹窗 */}
            <CurrencyModal
              isOpen={showCurrencyModal}
              onClose={() => setShowCurrencyModal(false)}
              selectedCurrency={selectedCurrency}
              onSelect={(currency) => {
                setSelectedCurrency(currency);
                setShowCurrencyModal(false);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Trading;
