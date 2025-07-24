import { useState, useEffect, useRef } from 'react';
import TradingChart from '../components/TradingChart';
import CurrencyModal from '../components/CurrencyModal';
import { usePriceContext } from '../contexts/PriceContext';

const Trading = () => {
  const { currentPrice, updatePrice } = usePriceContext();
  const [tradeAmount, setTradeAmount] = useState(1);
  const [payout, setPayout] = useState(1.75);
  const [chartData, setChartData] = useState([]);
  const [activeTrades, setActiveTrades] = useState([]);
  const [balance, setBalance] = useState(1000); // 初始余额1000
  const [selectedCurrency, setSelectedCurrency] = useState('USDT');
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const currentPriceRef = useRef(currentPrice); // 用于在定时器中访问最新价格
  const updatePriceRef = useRef(updatePrice); // 用于在定时器中访问最新的updatePrice函数

  // 生成模拟K线数据
  const generateMockData = () => {
    const data = [];
    let basePrice = 118735;
    const now = Date.now();

    for (let i = 100; i >= 0; i--) {
      const time = now - i * 60000; // 每分钟一个数据点
      const open = basePrice + (Math.random() - 0.5) * 200;
      const high = open + Math.random() * 100;
      const low = open - Math.random() * 100;
      const close = open + (Math.random() - 0.5) * 150;

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
    }

    // 模拟实时数据更新 - 每秒更新价格
    const interval = setInterval(() => {
      const prevPrice = currentPriceRef.current;
      const volatility = 15; // 减小波动性，适合每秒更新
      const newPrice = prevPrice + (Math.random() - 0.5) * volatility;
      const finalPrice = Math.max(1000, newPrice); // 确保价格不低于1000

      // 更新ref
      currentPriceRef.current = finalPrice;

      // 更新价格变化
      const change = finalPrice - prevPrice;
      const changePercent = (change / prevPrice) * 100;

      // 更新价格上下文
      updatePriceRef.current(finalPrice, change, changePercent);
    }, 1000); // 改为每秒更新

    // 每30秒更新一次K线数据
    const candleInterval = setInterval(() => {
      setChartData(prevData => {
        const lastData = prevData[prevData.length - 1];
        const currentPriceValue = currentPriceRef.current; // 使用ref获取最新价格
        const newCandle = {
          time: Date.now(),
          open: lastData.close,
          high: Math.max(lastData.close, currentPriceValue) + Math.random() * 20,
          low: Math.min(lastData.close, currentPriceValue) - Math.random() * 20,
          close: currentPriceValue
        };

        // 保持最近100个数据点
        const newData = [...prevData, newCandle];
        return newData.length > 100 ? newData.slice(-100) : newData;
      });
    }, 30000); // 30秒更新一次

    return () => {
      clearInterval(interval);
      clearInterval(candleInterval);
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

    // 创建新交易
    const newTrade = {
      id: Date.now(),
      direction,
      amount: tradeAmount,
      entryPrice: currentPrice,
      startTime: Date.now(),
      settled: false
    };

    setActiveTrades(prev => [...prev, newTrade]);
    setBalance(prev => prev - tradeAmount); // 扣除交易金额

    // 简单的成功提示
    const directionText = direction === 'up' ? '看涨' : '看跌';
    alert(`${directionText} 交易已提交！\n金额: $${tradeAmount}\n入场价格: $${currentPrice.toFixed(1)}\n结算时间: 1分钟`);
  };

  return (
    <div className="min-h-screen text-white overflow-x-hidden w-full max-w-full" style={{ backgroundColor: 'var(--color-bg-primary)', boxSizing: 'border-box' }}>
      {/* 主要内容区域 - 添加顶部边距避免被navbar挡住 */}
      <div style={{ paddingTop: '64px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        {/* 价格信息栏 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 w-full" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button className="text-gray-400 hover:text-white flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">₿</span>
            </div>
            <div className="min-w-0">
              <div className="text-white font-medium">BTC-USD</div>
              <div className="text-gray-400 text-sm">Binary Options</div>
            </div>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-normal">{currentPrice.toFixed(1)}</div>
          <div className="text-sm flex items-center justify-end gap-2 text-green-500">
            <span>▲ 0%</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400">实时</span>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div>
        {/* 图表区域 */}
        <div className="h-96 relative w-full max-w-full overflow-hidden" style={{ boxSizing: 'border-box' }}>
          <TradingChart
            data={chartData}
            currentPrice={currentPrice}
            activeTrades={activeTrades}
          />
        </div>

        {/* 底部交易面板 */}
        <div className="border-t p-4 w-full max-w-full" style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderColor: 'var(--color-border)',
          paddingBottom: '80px',  // 为底部栏留出空间
          boxSizing: 'border-box'
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
              <button
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
              </button>

              <div className="flex flex-col items-center justify-center px-4">
                <div className="text-gray-400 text-xs">1m</div>
                <svg width="24" height="24" fill="none" stroke="#8f8f8f" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <button
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
              </button>
            </div>
          </div>
        </div>



        {/* 测试内容区域 - 让页面可以滚动 */}
        <div className="p-4 space-y-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
            <h3 className="text-lg font-medium text-white mb-2">交易历史</h3>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                  <div>
                    <div className="text-white font-medium">BTC-USD #{i}</div>
                    <div className="text-gray-400 text-sm">2024-01-15 10:3{i}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${i % 2 === 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {i % 2 === 0 ? '+$12.50' : '-$8.75'}
                    </div>
                    <div className="text-gray-400 text-sm">{i % 2 === 0 ? 'Win' : 'Loss'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
            <h3 className="text-lg font-medium text-white mb-2">市场分析</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                  <div className="text-white font-medium mb-1">技术指标 #{i}</div>
                  <div className="text-gray-400 text-sm">
                    当前市场趋势显示{i % 2 === 0 ? '看涨' : '看跌'}信号，建议关注关键支撑位和阻力位的突破情况。
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
            <h3 className="text-lg font-medium text-white mb-2">风险提示</h3>
            <div className="text-gray-400 text-sm space-y-2">
              <p>• 二元期权交易存在高风险，可能导致全部投资损失</p>
              <p>• 请根据自身风险承受能力进行投资</p>
              <p>• 建议设置合理的止损点和资金管理策略</p>
              <p>• 市场波动可能影响交易结果</p>
            </div>
          </div>

          {/* 更多测试内容确保页面可以滚动 */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
            <h3 className="text-lg font-medium text-white mb-2">更多内容</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                  <div className="text-white font-medium mb-2">测试内容块 #{i}</div>
                  <div className="text-gray-400 text-sm">
                    这是第{i}个测试内容块，用于确保页面有足够的高度可以滚动。
                    当您向下滚动超过30px时，顶部导航栏应该会隐藏。
                    当您向上滚动时，顶部导航栏应该会重新显示。
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 底部安全边距 */}
          <div style={{ height: '200px' }}></div>
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
      </div>
    </div>
  );
};

export default Trading;
