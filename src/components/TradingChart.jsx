import { useState, useEffect, useRef } from 'react';

const TradingChart = ({ data, currentPrice, activeTrades, onPriceUpdate, chartType = 'candlestick' }) => {
  const canvasRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [priceHistory, setPriceHistory] = useState([]);
  // 空白预测区占整个图表宽度的1/3
  const currentPriceRef = useRef(currentPrice); // 用于在定时器中访问最新价格

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const parent = canvasRef.current.parentElement;
        const containerWidth = parent.clientWidth;

        // 按照428:469的比例计算高度
        const aspectRatio = 469 / 428;
        const calculatedHeight = containerWidth * aspectRatio;

        setDimensions({
          width: containerWidth,
          height: calculatedHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // 更新currentPriceRef当currentPrice变化时
  useEffect(() => {
    currentPriceRef.current = currentPrice;
  }, [currentPrice]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());

      // 每秒记录价格历史（用于实时价格线）
      setPriceHistory(prev => {
        const newHistory = [...prev, { time: Date.now(), price: currentPriceRef.current }];
        // 只保留最近60秒的数据（与1分钟K线跨度一致）
        return newHistory.filter(item => Date.now() - item.time < 60000);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []); // 移除currentPrice依赖，避免无限循环

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = dimensions;

    // 设置高DPI支持
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    // 清空画布
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // 计算图表区域
    const chartTop = 20;
    const chartHeight = height - 80; // 为底部时间轴留空间
    const chartLeft = 0;
    const totalChartWidth = width - 80; // 总图表宽度（为右侧价格标签留空间）

    // K线区域占2/3，预测区占1/3
    const klineWidth = Math.floor(totalChartWidth * 2 / 3);
    const predictionZoneWidth = totalChartWidth - klineWidth;
    const predictionZoneLeft = klineWidth;

    // 计算价格范围（包含历史价格和当前价格）
    const allPrices = [...data.flatMap(d => [d.high, d.low]), currentPrice];
    if (priceHistory.length > 0) {
      allPrices.push(...priceHistory.map(p => p.price));
    }
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice;
    const padding = priceRange * 0.05;

    // 预测区背景透明，不需要绘制背景色

    // 绘制预测区边界线
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.moveTo(predictionZoneLeft, chartTop);
    ctx.lineTo(predictionZoneLeft, chartTop + chartHeight);
    ctx.stroke();
    ctx.setLineDash([]);

    // 预测区不需要文案标签

    // 绘制价格网格线和标签
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#666';
    ctx.font = '11px Arial';

    for (let i = 0; i <= 8; i++) {
      const price = maxPrice + padding - (i / 8) * (priceRange + 2 * padding);
      const y = chartTop + (chartHeight / 8) * i;

      // 水平网格线（延伸到整个图表区域包括预测区）
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(totalChartWidth, y);
      ctx.stroke();

      // 价格标签（右侧）
      ctx.textAlign = 'left';
      ctx.fillText(price.toFixed(1), totalChartWidth + 8, y + 4);
    }

    // 绘制时间网格线（只在K线区域）
    const timeLabels = 6;
    for (let i = 0; i <= timeLabels; i++) {
      const x = klineWidth / timeLabels * i;
      ctx.beginPath();
      ctx.moveTo(x, chartTop);
      ctx.lineTo(x, chartTop + chartHeight);
      ctx.stroke();
    }

    // 绘制图表（只在左侧2/3区域）
    const candleWidth = Math.max(1, klineWidth / data.length * 0.6);
    const candleSpacing = klineWidth / data.length;

    if (chartType === 'candlestick') {
      // 绘制K线图
      data.forEach((candle, index) => {
        const x = index * candleSpacing + candleSpacing / 2;

        // 计算Y坐标
        const openY = chartTop + chartHeight - ((candle.open - minPrice + padding) / (priceRange + 2 * padding)) * chartHeight;
        const closeY = chartTop + chartHeight - ((candle.close - minPrice + padding) / (priceRange + 2 * padding)) * chartHeight;
        const highY = chartTop + chartHeight - ((candle.high - minPrice + padding) / (priceRange + 2 * padding)) * chartHeight;
        const lowY = chartTop + chartHeight - ((candle.low - minPrice + padding) / (priceRange + 2 * padding)) * chartHeight;

        const isGreen = candle.close > candle.open;

        // 绘制影线
        ctx.strokeStyle = isGreen ? '#00ff88' : '#ff4444';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // 绘制实体
        ctx.fillStyle = isGreen ? '#00ff88' : '#ff4444';
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.abs(closeY - openY);

        if (bodyHeight < 1) {
          ctx.fillRect(x - candleWidth / 2, bodyTop - 0.5, candleWidth, 1);
        } else {
          ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
        }
      });
    } else if (chartType === 'line') {
      // 绘制折线图
      ctx.strokeStyle = '#00bcd4';
      ctx.lineWidth = 2;
      ctx.beginPath();

      data.forEach((candle, index) => {
        const x = index * candleSpacing + candleSpacing / 2;
        const closeY = chartTop + chartHeight - ((candle.close - minPrice + padding) / (priceRange + 2 * padding)) * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, closeY);
        } else {
          ctx.lineTo(x, closeY);
        }
      });

      ctx.stroke();

      // 在折线图上添加数据点
      data.forEach((candle, index) => {
        const x = index * candleSpacing + candleSpacing / 2;
        const closeY = chartTop + chartHeight - ((candle.close - minPrice + padding) / (priceRange + 2 * padding)) * chartHeight;

        ctx.fillStyle = '#00bcd4';
        ctx.beginPath();
        ctx.arc(x, closeY, 2, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // 绘制当前价格线
    if (currentPrice) {
      const priceY = chartTop + chartHeight - ((currentPrice - minPrice + padding) / (priceRange + 2 * padding)) * chartHeight;
      
      // 金色虚线（延伸到整个图表区域包括预测区）
      ctx.strokeStyle = '#eaae36';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(0, priceY);
      ctx.lineTo(totalChartWidth, priceY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 计算价格文字宽度
      const priceText = currentPrice.toFixed(1);
      ctx.font = 'bold 11px Arial';
      const textWidth = ctx.measureText(priceText).width;
      const labelWidth = textWidth + 16; // 左右各8px padding
      const labelHeight = 20;
      const labelX = totalChartWidth + 5; // 紧贴图表右边

      // 绘制圆角价格标签背景
      ctx.fillStyle = '#eaae36'; // 使用与交易按钮一致的颜色
      ctx.beginPath();
      const radius = 4;
      ctx.moveTo(labelX + radius, priceY - labelHeight/2);
      ctx.lineTo(labelX + labelWidth - radius, priceY - labelHeight/2);
      ctx.quadraticCurveTo(labelX + labelWidth, priceY - labelHeight/2, labelX + labelWidth, priceY - labelHeight/2 + radius);
      ctx.lineTo(labelX + labelWidth, priceY + labelHeight/2 - radius);
      ctx.quadraticCurveTo(labelX + labelWidth, priceY + labelHeight/2, labelX + labelWidth - radius, priceY + labelHeight/2);
      ctx.lineTo(labelX + radius, priceY + labelHeight/2);
      ctx.quadraticCurveTo(labelX, priceY + labelHeight/2, labelX, priceY + labelHeight/2 - radius);
      ctx.lineTo(labelX, priceY - labelHeight/2 + radius);
      ctx.quadraticCurveTo(labelX, priceY - labelHeight/2, labelX + radius, priceY - labelHeight/2);
      ctx.closePath();
      ctx.fill();

      // 价格文字（居中）
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.fillText(priceText, labelX + labelWidth/2, priceY + 4);
    }

    // 绘制实时价格曲线（1分30秒价格线）
    if (priceHistory.length > 1) {
      ctx.strokeStyle = '#00bcd4';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.beginPath();

      const timeSpan = 60000; // 60秒
      const oldestTime = currentTime - timeSpan;

      priceHistory.forEach((point, index) => {
        if (point.time >= oldestTime) {
          // 计算时间位置（在预测区内）
          const timeProgress = (point.time - oldestTime) / timeSpan;
          const x = predictionZoneLeft + (timeProgress * predictionZoneWidth);
          const y = chartTop + chartHeight - ((point.price - minPrice + padding) / (priceRange + 2 * padding)) * chartHeight;

          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
      });

      ctx.stroke();

      // 在实时价格线上标记当前价格点
      if (priceHistory.length > 0) {
        const lastPoint = priceHistory[priceHistory.length - 1];
        const timeProgress = (lastPoint.time - oldestTime) / timeSpan;
        const x = predictionZoneLeft + (timeProgress * predictionZoneWidth);
        const y = chartTop + chartHeight - ((lastPoint.price - minPrice + padding) / (priceRange + 2 * padding)) * chartHeight;

        ctx.fillStyle = '#00bcd4';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    // 绘制活跃交易标记
    activeTrades.forEach(trade => {
      const tradeStartTime = trade.startTime;
      const tradeEndTime = trade.startTime + 60000; // 1分钟后
      const currentTimeMs = currentTime;

      // 计算交易开始位置
      const startIndex = data.findIndex(d => d.time >= tradeStartTime);
      if (startIndex === -1) return;

      const startX = startIndex * candleSpacing + candleSpacing / 2;
      const entryPriceY = chartTop + chartHeight - ((trade.entryPrice - minPrice + padding) / (priceRange + 2 * padding)) * chartHeight;

      // 绘制买入点标记 - 更精致的设计
      const isUp = trade.direction === 'up';
      const isSettled = trade.settled;
      const isWin = trade.result === 'win';

      // 根据交易状态选择颜色
      let mainColor, shadowColor, glowColor;
      if (isSettled) {
        // 已结算：显示输赢状态
        mainColor = isWin ? '#00ff88' : '#ff4444';
        shadowColor = isWin ? '#00cc66' : '#cc3333';
        glowColor = isWin ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 68, 68, 0.5)';
      } else {
        // 进行中：显示方向
        mainColor = isUp ? '#00ff88' : '#ff4444';
        shadowColor = isUp ? '#00cc66' : '#cc3333';
        glowColor = isUp ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 68, 68, 0.3)';
      }

      // 计算动画效果（新交易会有脉冲效果）
      const tradeAge = currentTimeMs - tradeStartTime;
      const pulseScale = tradeAge < 3000 ? 1 + Math.sin(tradeAge / 200) * 0.2 : 1;
      const baseRadius = 12 * pulseScale;

      // 绘制外圈光晕
      const gradient = ctx.createRadialGradient(startX, entryPriceY, 0, startX, entryPriceY, baseRadius + 8);
      gradient.addColorStop(0, glowColor);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(startX, entryPriceY, baseRadius + 8, 0, 2 * Math.PI);
      ctx.fill();

      // 绘制阴影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(startX + 2, entryPriceY + 2, baseRadius, 0, 2 * Math.PI);
      ctx.fill();

      // 绘制主圆圈
      ctx.fillStyle = mainColor;
      ctx.beginPath();
      ctx.arc(startX, entryPriceY, baseRadius, 0, 2 * Math.PI);
      ctx.fill();

      // 绘制内圈渐变
      const innerGradient = ctx.createRadialGradient(
        startX - 3, entryPriceY - 3, 0,
        startX, entryPriceY, baseRadius
      );
      innerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      innerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = innerGradient;
      ctx.beginPath();
      ctx.arc(startX, entryPriceY, baseRadius, 0, 2 * Math.PI);
      ctx.fill();

      // 绘制边框
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(startX, entryPriceY, baseRadius, 0, 2 * Math.PI);
      ctx.stroke();

      // 绘制三角形图标
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (isUp) {
        // 向上三角形 - 更精致的形状
        ctx.moveTo(startX, entryPriceY - 7);
        ctx.lineTo(startX - 6, entryPriceY + 5);
        ctx.lineTo(startX + 6, entryPriceY + 5);
      } else {
        // 向下三角形 - 更精致的形状
        ctx.moveTo(startX, entryPriceY + 7);
        ctx.lineTo(startX - 6, entryPriceY - 5);
        ctx.lineTo(startX + 6, entryPriceY - 5);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 如果交易已结算，添加结果指示器
      if (isSettled) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        const resultText = isWin ? '✓' : '✗';
        ctx.fillText(resultText, startX + 8, entryPriceY - 8);
      }

      // 绘制价格标签
      const priceText = trade.entryPrice.toFixed(1);
      const labelX = startX + baseRadius + 15;
      const labelY = entryPriceY;

      // 标签背景 - 手动绘制圆角矩形
      const labelWidth = 60;
      const labelHeight = 20;
      const radius = 8;

      ctx.fillStyle = mainColor;
      ctx.beginPath();
      ctx.moveTo(labelX - 5 + radius, labelY - 10);
      ctx.lineTo(labelX - 5 + labelWidth - radius, labelY - 10);
      ctx.quadraticCurveTo(labelX - 5 + labelWidth, labelY - 10, labelX - 5 + labelWidth, labelY - 10 + radius);
      ctx.lineTo(labelX - 5 + labelWidth, labelY - 10 + labelHeight - radius);
      ctx.quadraticCurveTo(labelX - 5 + labelWidth, labelY - 10 + labelHeight, labelX - 5 + labelWidth - radius, labelY - 10 + labelHeight);
      ctx.lineTo(labelX - 5 + radius, labelY - 10 + labelHeight);
      ctx.quadraticCurveTo(labelX - 5, labelY - 10 + labelHeight, labelX - 5, labelY - 10 + labelHeight - radius);
      ctx.lineTo(labelX - 5, labelY - 10 + radius);
      ctx.quadraticCurveTo(labelX - 5, labelY - 10, labelX - 5 + radius, labelY - 10);
      ctx.closePath();
      ctx.fill();

      // 标签边框
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 标签文字
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(priceText, labelX, labelY + 3);

      // 连接线
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX + baseRadius, entryPriceY);
      ctx.lineTo(labelX - 5, labelY);
      ctx.stroke();

      // 绘制买入价格标记线
      ctx.strokeStyle = trade.direction === 'up' ? '#00ff88' : '#ff4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(startX, entryPriceY);
      ctx.lineTo(width - 80, entryPriceY);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // 如果交易还在进行中，绘制时间进度线
      if (currentTimeMs < tradeEndTime) {
        const progress = (currentTimeMs - tradeStartTime) / 60000;
        const progressX = startX + progress * (width - 80 - startX);
        
        // 绘制进度虚线
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(progressX, chartTop);
        ctx.lineTo(progressX, chartTop + chartHeight);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // 交易结束，绘制结算线
        const endX = width - 80;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(endX, chartTop);
        ctx.lineTo(endX, chartTop + chartHeight);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // 绘制时间轴标签
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    for (let i = 0; i <= timeLabels; i++) {
      const x = (width - 80) / timeLabels * i;
      const timeIndex = Math.floor((data.length - 1) / timeLabels * i);
      if (data[timeIndex]) {
        const time = new Date(data[timeIndex].time);
        const timeStr = time.toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        ctx.fillText(timeStr, x - 15, height - 10);
      }
    }

  }, [data, currentPrice, activeTrades, dimensions, priceHistory]);

  return (
    <div className="w-full h-full bg-black relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default TradingChart;
