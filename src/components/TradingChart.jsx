import { useState, useEffect, useRef } from 'react';

const TradingChart = ({ data, currentPrice, activeTrades, onPriceUpdate, chartType = 'candlestick' }) => {
  const canvasRef = useRef();
  const animationFrameRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [priceHistory, setPriceHistory] = useState([]);
  const [realTimePrices, setRealTimePrices] = useState([]); // 实时价格数据，每秒更新
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

  // 使用requestAnimationFrame实现流畅的动画更新
  useEffect(() => {
    let lastPriceUpdateTime = 0;

    const animate = (timestamp) => {
      setCurrentTime(timestamp);

      // 每秒更新一次价格历史和实时价格数据
      if (timestamp - lastPriceUpdateTime >= 1000) {
        const now = Date.now();

        // 更新价格历史（用于左侧1分30秒真实走势）
        setPriceHistory(prev => {
          const newHistory = [...prev, { time: now, price: currentPriceRef.current }];
          // 只保留最近90秒的数据
          return newHistory.filter(item => now - item.time < 90000);
        });

        // 更新实时价格数据（用于右侧预测区的实时价格线）
        setRealTimePrices(prev => {
          const newPrices = [...prev, { time: now, price: currentPriceRef.current }];
          // 只保留最近30秒的数据（预测区时间范围）
          return newPrices.filter(item => now - item.time < 30000);
        });

        lastPriceUpdateTime = timestamp;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

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
    const totalChartWidth = width - 80; // 总图表宽度（为右侧价格标签留空间）
    const totalTimeLabels = 7; // 整个图表显示7个时间标签

    // 左侧历史数据区域占2/3，右侧预测区占1/3
    const historyZoneWidth = Math.floor(totalChartWidth * 2 / 3);
    const predictionZoneWidth = totalChartWidth - historyZoneWidth;
    const predictionZoneLeft = historyZoneWidth;

    // 计算价格范围（包含历史数据、价格历史和实时价格）
    const allPrices = [];

    // 添加K线数据价格
    if (data && data.length > 0) {
      allPrices.push(...data.flatMap(d => [d.high, d.low]));
    }

    // 添加价格历史数据
    if (priceHistory.length > 0) {
      allPrices.push(...priceHistory.map(p => p.price));
    }

    // 添加实时价格数据
    if (realTimePrices.length > 0) {
      allPrices.push(...realTimePrices.map(p => p.price));
    }

    // 添加当前价格
    allPrices.push(currentPrice);

    // 添加活跃交易的价格，确保买入点和结算点都在可视范围内
    activeTrades.forEach(trade => {
      allPrices.push(trade.entryPrice);
      if (trade.settled && trade.settlementPrice) {
        allPrices.push(trade.settlementPrice);
      }
    });

    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    let priceRange = maxPrice - minPrice;

    // 确保最小价格范围，避免图表过于压缩
    const minRange = Math.max(minPrice * 0.01, 100); // 至少1%的价格范围或100的绝对范围
    if (priceRange < minRange) {
      priceRange = minRange;
    }

    const padding = priceRange * 0.1; // 增加padding以提供更好的视觉效果

    // 预测区背景透明，不需要绘制背景色

    // 不再绘制固定的预测区边界线，改为动态的结算时间线
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

    // 绘制时间网格线（整个图表区域，对应7个时间标签）
    for (let i = 0; i < totalTimeLabels; i++) {
      const x = (totalChartWidth / (totalTimeLabels - 1)) * i;
      ctx.beginPath();
      ctx.moveTo(x, chartTop);
      ctx.lineTo(x, chartTop + chartHeight);
      ctx.stroke();
    }

    // 绘制左侧历史数据区域（使用实时价格历史轨迹）
    if (chartType === 'line' && priceHistory.length > 1) {
      // 使用实时价格历史数据绘制折线图
      ctx.strokeStyle = '#00bcd4';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const now = Date.now();
      const timeSpan = 90000; // 90秒历史数据

      priceHistory.forEach((point, index) => {
        // 计算时间位置
        const timeFromStart = point.time - (now - timeSpan);
        if (timeFromStart >= 0) {
          const timeProgress = timeFromStart / timeSpan;
          const x = timeProgress * historyZoneWidth;
          const y = chartTop + chartHeight - ((point.price - minPrice + padding) / (priceRange + 2 * padding)) * chartHeight;

          if (index === 0 || timeFromStart === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
      });

      ctx.stroke();

      // 添加折线图下方的渐变填充
      ctx.save();

      // 创建渐变（从折线到底部）
      const gradient = ctx.createLinearGradient(0, chartTop, 0, chartTop + chartHeight);
      gradient.addColorStop(0, 'rgba(0, 188, 212, 0.3)'); // 顶部：30%透明度
      gradient.addColorStop(0.5, 'rgba(0, 188, 212, 0.15)'); // 中间：15%透明度
      gradient.addColorStop(1, 'rgba(0, 188, 212, 0.05)'); // 底部：5%透明度

      ctx.fillStyle = gradient;
      ctx.beginPath();

      // 重新绘制折线路径用于填充
      priceHistory.forEach((point, index) => {
        const timeFromStart = point.time - (now - timeSpan);
        if (timeFromStart >= 0) {
          const timeProgress = timeFromStart / timeSpan;
          const x = timeProgress * historyZoneWidth;
          const y = chartTop + chartHeight - ((point.price - minPrice + padding) / (priceRange + 2 * padding)) * chartHeight;

          if (index === 0 || timeFromStart === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
      });

      // 连接到底部形成封闭区域
      if (priceHistory.length > 0) {
        const lastValidPoint = priceHistory.filter(p => p.time - (now - timeSpan) >= 0).pop();
        const firstValidPoint = priceHistory.find(p => p.time - (now - timeSpan) >= 0);

        if (lastValidPoint && firstValidPoint) {
          const lastTimeProgress = (lastValidPoint.time - (now - timeSpan)) / timeSpan;
          const firstTimeProgress = (firstValidPoint.time - (now - timeSpan)) / timeSpan;
          const lastX = lastTimeProgress * historyZoneWidth;
          const firstX = firstTimeProgress * historyZoneWidth;

          ctx.lineTo(lastX, chartTop + chartHeight); // 右下角
          ctx.lineTo(firstX, chartTop + chartHeight); // 左下角
          ctx.closePath();
        }
      }

      ctx.fill();
      ctx.restore();

      // 在折线图上添加数据点
      priceHistory.forEach((point) => {
        const timeFromStart = point.time - (now - timeSpan);
        if (timeFromStart >= 0) {
          const timeProgress = timeFromStart / timeSpan;
          const x = timeProgress * historyZoneWidth;
          const y = chartTop + chartHeight - ((point.price - minPrice + padding) / (priceRange + 2 * padding)) * chartHeight;

          ctx.fillStyle = '#00bcd4';
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, 2 * Math.PI);
          ctx.fill();
        }
      });
    } else if (chartType === 'candlestick' && data && data.length > 0) {
      // K线图模式 - 保持原有逻辑
      const candleWidth = Math.max(1, historyZoneWidth / data.length * 0.6);
      const candleSpacing = historyZoneWidth / data.length;

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
    }

    // 绘制右侧预测区域的实时价格线（每秒更新）- 注释掉，保持预测区空白
    /*
    if (realTimePrices.length > 1) {
      ctx.strokeStyle = '#00bcd4';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.beginPath();

      const now = Date.now();
      const timeSpan = 30000; // 30秒预测区

      realTimePrices.forEach((point, index) => {
        const timeFromStart = point.time - (now - timeSpan);
        if (timeFromStart >= 0) {
          const timeProgress = timeFromStart / timeSpan;
          const x = predictionZoneLeft + (timeProgress * predictionZoneWidth);
          const y = chartTop + chartHeight - ((point.price - minPrice + padding) / (priceRange + 2 * padding)) * chartHeight;

          if (index === 0 || timeFromStart === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
      });

      ctx.stroke();

      // 在实时价格线上添加数据点
      realTimePrices.forEach((point) => {
        const timeFromStart = point.time - (now - timeSpan);
        if (timeFromStart >= 0) {
          const timeProgress = timeFromStart / timeSpan;
          const x = predictionZoneLeft + (timeProgress * predictionZoneWidth);
          const y = chartTop + chartHeight - ((point.price - minPrice + padding) / (priceRange + 2 * padding)) * chartHeight;

          ctx.fillStyle = '#00bcd4';
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, 2 * Math.PI);
          ctx.fill();
        }
      });
    }
    */

    // 绘制当前价格线 - 使用传入的currentPrice参数，与价格信息栏保持同步
    const currentPriceValue = currentPriceRef.current;
    const priceY = chartTop + chartHeight - ((currentPriceValue - minPrice + padding) / (priceRange + 2 * padding)) * chartHeight;

    // 金色虚线（延伸到整个图表区域包括预测区）
    ctx.strokeStyle = '#eaae36';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(0, priceY);
    ctx.lineTo(totalChartWidth, priceY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 绘制闪烁的实心圆标注当前价格
    const pulseTime = (currentTime % 1500) / 1500; // 1.5秒周期
    const pulseAlpha = 0.6 + 0.4 * Math.sin(pulseTime * Math.PI * 2); // 0.6-1.0之间脉冲
    const pulseRadius = 4 + Math.sin(pulseTime * Math.PI * 2) * 1; // 4-5px之间脉冲

    // 当前价格点位置（应该与折线图最新点重合）
    let currentPriceX;
    if (data && data.length > 0) {
      // 计算最新数据点的X位置
      const candleSpacing = historyZoneWidth / data.length;
      currentPriceX = (data.length - 1) * candleSpacing + candleSpacing / 2;
    } else {
      // 如果没有数据，默认在分界线位置
      currentPriceX = historyZoneWidth;
    }

    // 外圈光晕
    const glowGradient = ctx.createRadialGradient(currentPriceX, priceY, 0, currentPriceX, priceY, pulseRadius + 6);
    glowGradient.addColorStop(0, `rgba(234, 174, 54, ${pulseAlpha * 0.8})`);
    glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(currentPriceX, priceY, pulseRadius + 6, 0, 2 * Math.PI);
    ctx.fill();

    // 主实心圆
    ctx.fillStyle = `rgba(234, 174, 54, ${pulseAlpha})`;
    ctx.beginPath();
    ctx.arc(currentPriceX, priceY, pulseRadius, 0, 2 * Math.PI);
    ctx.fill();

    // 内部高亮点
    ctx.fillStyle = `rgba(255, 255, 255, ${pulseAlpha * 0.9})`;
    ctx.beginPath();
    ctx.arc(currentPriceX, priceY, pulseRadius * 0.4, 0, 2 * Math.PI);
    ctx.fill();

    // 计算价格文字宽度
    const priceText = currentPriceValue.toFixed(1);
    ctx.font = 'bold 11px Arial';
    const textWidth = ctx.measureText(priceText).width;
    const labelWidth = textWidth + 16; // 左右各8px padding
    const labelHeight = 20;
    const labelX = totalChartWidth + 5; // 紧贴图表右边

    // 绘制圆角价格标签背景
    ctx.fillStyle = '#eaae36';
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

    // 绘制预测区图表（根据选择的图表类型）- 暂时注释，保留空白预测区
    /*
    if (priceHistory.length > 1) {
      const timeSpan = 90000; // 90秒（1分30秒）

      // 修改：预测区显示从当前时间开始的未来1分30秒
      // 计算当前时间在预测区的起始位置

      if (chartType === 'line') {
        // 折线图模式
        ctx.strokeStyle = '#00bcd4';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();

        priceHistory.forEach((point, index) => {
          // 只显示最近的价格历史，映射到预测区域
          const timeFromNow = point.time - (currentTime - timeSpan);
          if (timeFromNow >= 0) {
            // 计算时间位置（在预测区内，从左到右表示从过去到现在）
            const timeProgress = timeFromNow / timeSpan;
            const x = predictionZoneLeft + (timeProgress * predictionZoneWidth);
            const y = chartTop + chartHeight - ((point.price - minPrice + padding) / (priceRange + 2 * padding)) * chartHeight;

            if (index === 0 || timeFromNow === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
        });

        ctx.stroke();

        // 在折线图上标记数据点
        priceHistory.forEach((point) => {
          const timeFromNow = point.time - (currentTime - timeSpan);
          if (timeFromNow >= 0) {
            const timeProgress = timeFromNow / timeSpan;
            const x = predictionZoneLeft + (timeProgress * predictionZoneWidth);
            const y = chartTop + chartHeight - ((point.price - minPrice + padding) / (priceRange + 2 * padding)) * chartHeight;

            ctx.fillStyle = '#00bcd4';
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, 2 * Math.PI);
            ctx.fill();
          }
        });
      } else if (chartType === 'candlestick') {
        // K线图模式 - 在预测区显示简化的K线
        // 将价格历史数据转换为K线数据（每5秒一个K线）
        const candleData = [];

        for (let i = 0; i < priceHistory.length; i += 5) {
          const group = priceHistory.slice(i, i + 5);
          if (group.length > 0) {
            const open = group[0].price;
            const close = group[group.length - 1].price;
            const high = Math.max(...group.map(p => p.price));
            const low = Math.min(...group.map(p => p.price));
            const time = group[group.length - 1].time;

            candleData.push({ open, high, low, close, time });
          }
        }

        // 绘制预测区K线
        candleData.forEach((candle) => {
          const timeFromNow = candle.time - (currentTime - timeSpan);
          if (timeFromNow >= 0) {
            const timeProgress = timeFromNow / timeSpan;
            const x = predictionZoneLeft + (timeProgress * predictionZoneWidth);

            const openY = chartTop + chartHeight - ((candle.open - minPrice + padding) / (priceRange + 2 * padding)) * chartHeight;
            const closeY = chartTop + chartHeight - ((candle.close - minPrice + padding) / (priceRange + 2 * padding)) * chartHeight;
            const highY = chartTop + chartHeight - ((candle.high - minPrice + padding) / (priceRange + 2 * padding)) * chartHeight;
            const lowY = chartTop + chartHeight - ((candle.low - minPrice + padding) / (priceRange + 2 * padding)) * chartHeight;

            const isGreen = candle.close > candle.open;
            const candleWidth = Math.max(2, predictionZoneWidth / candleData.length * 0.6);

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
          }
        });
      }
    }
    */

    // 绘制活跃交易标记
    activeTrades.forEach(trade => {
      const tradeStartTime = trade.startTime;
      const tradeEndTime = trade.startTime + 60000; // 1分钟后
      const currentTime = Date.now();

      // 如果交易已结算且超过显示时间，直接跳过不显示
      if (trade.settled && (currentTime - tradeEndTime > 5000)) { // 结算后5秒消失
        return;
      }

      // 修复：计算买入点在实时价格历史轨迹上的准确位置
      const now = Date.now();
      const timeSpan = 90000; // 90秒历史数据

      // 找到最接近交易时间的价格历史点
      let closestPoint = null;
      let minTimeDiff = Infinity;

      priceHistory.forEach((point) => {
        const timeDiff = Math.abs(point.time - tradeStartTime);
        if (timeDiff < minTimeDiff) {
          minTimeDiff = timeDiff;
          closestPoint = point;
        }
      });

      // 如果没有找到历史点，使用交易时的价格和时间
      if (!closestPoint) {
        closestPoint = {
          time: tradeStartTime,
          price: trade.entryPrice
        };
      }

      // 计算买入点在图表上的位置
      const timeFromStart = closestPoint.time - (now - timeSpan);
      if (timeFromStart < 0) return; // 如果交易时间太早，不在显示范围内

      const timeProgress = timeFromStart / timeSpan;
      const startX = timeProgress * historyZoneWidth;

      // 买入点Y坐标：使用实际的交易价格
      const actualEntryPrice = closestPoint.price;
      const entryPriceY = chartTop + chartHeight - ((actualEntryPrice - minPrice + padding) / (priceRange + 2 * padding)) * chartHeight;

      // 绘制买入点标记 - 更精致的设计
      const isUp = trade.direction === 'up';
      const isSettled = trade.settled;
      const isWin = trade.result === 'win';

      // 根据交易状态选择颜色（使用新的颜色方案）
      let mainColor;
      if (isSettled) {
        // 已结算：显示输赢状态
        mainColor = isWin ? '#10b981' : '#ef4444';
      } else {
        // 进行中：显示方向
        mainColor = isUp ? '#10b981' : '#ef4444';
      }



      // 买入点使用固定大小，不需要脉冲效果
      const baseRadius = 12;

      // 计算结算时间位置（基于实时价格历史）
      const settlementTimeFromStart = tradeEndTime - (now - timeSpan);
      let settlementX;

      if (settlementTimeFromStart >= 0 && settlementTimeFromStart <= timeSpan) {
        // 结算时间在历史数据范围内
        const settlementTimeProgress = settlementTimeFromStart / timeSpan;
        settlementX = settlementTimeProgress * historyZoneWidth;
      } else {
        // 结算时间在预测区域内
        const timeFromHistoryEnd = tradeEndTime - now;
        const predictionProgress = Math.min(1, Math.max(0, timeFromHistoryEnd / 30000)); // 30秒预测区
        settlementX = historyZoneWidth + (predictionProgress * predictionZoneWidth);
      }

      // 只在交易进行中显示买入价格线和结算时间线
      if (!isSettled) {
        // 先绘制买入价格标记线 - 直线，从买入点到结算点
        ctx.strokeStyle = trade.direction === 'up' ? '#10b981' : '#ef4444';
        ctx.lineWidth = 1;
        ctx.setLineDash([]); // 改为直线，不是虚线

        // 从买入点右侧到结算点
        ctx.beginPath();
        ctx.moveTo(startX + baseRadius + 5, entryPriceY);
        ctx.lineTo(settlementX, entryPriceY);
        ctx.stroke();

        // 绘制结算时间虚线（与当前价格线一致的粗细）
        ctx.strokeStyle = trade.direction === 'up' ? '#10b981' : '#ef4444';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(settlementX, chartTop);
        ctx.lineTo(settlementX, chartTop + chartHeight);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 重新绘制买入点色块（在横线之后，确保层级正确）
      // 绘制外圈光晕
      const gradient = ctx.createRadialGradient(startX, entryPriceY, 0, startX, entryPriceY, baseRadius + 8);
      gradient.addColorStop(0, trade.direction === 'up' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)');
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

      // 绘制三角形图标 - 使用黑色
      ctx.fillStyle = '#000000';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
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

      // 如果交易已结算，添加结算点指示器
      if (isSettled) {
        // 计算结算点位置（基于实时价格历史）
        let settlementX;
        let settlementPriceY;
        let settlementPrice = trade.settlementPrice || currentPriceRef.current;

        const settlementTimeFromStart = tradeEndTime - (now - timeSpan);

        if (settlementTimeFromStart >= 0 && settlementTimeFromStart <= timeSpan) {
          // 结算时间在历史数据范围内
          const settlementTimeProgress = settlementTimeFromStart / timeSpan;
          settlementX = settlementTimeProgress * historyZoneWidth;

          // 尝试找到结算时间附近的价格历史点
          let closestSettlementPoint = null;
          let minSettlementTimeDiff = Infinity;

          priceHistory.forEach((point) => {
            const timeDiff = Math.abs(point.time - tradeEndTime);
            if (timeDiff < minSettlementTimeDiff) {
              minSettlementTimeDiff = timeDiff;
              closestSettlementPoint = point;
            }
          });

          if (closestSettlementPoint) {
            settlementPrice = closestSettlementPoint.price;
          }
        } else {
          // 结算时间在预测区域内
          const timeFromHistoryEnd = tradeEndTime - now;
          const predictionProgress = Math.min(1, Math.max(0, timeFromHistoryEnd / 30000));
          settlementX = historyZoneWidth + (predictionProgress * predictionZoneWidth);
        }

        settlementPriceY = chartTop + chartHeight - ((settlementPrice - minPrice + padding) / (priceRange + 2 * padding)) * chartHeight;

        // 判断价格升降
        const priceChange = (settlementPrice > actualEntryPrice) ? 'up' : 'down';
        const changeColor = priceChange === 'up' ? '#10b981' : '#ef4444';

        // 绘制结算点
        ctx.fillStyle = changeColor;
        ctx.beginPath();
        ctx.arc(settlementX, settlementPriceY, 8, 0, 2 * Math.PI);
        ctx.fill();

        // 绘制结算点边框
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(settlementX, settlementPriceY, 8, 0, 2 * Math.PI);
        ctx.stroke();

        // 绘制升降三角形（黑色）
        ctx.fillStyle = '#000000';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (priceChange === 'up') {
          // 向上三角形
          ctx.moveTo(settlementX, settlementPriceY - 5);
          ctx.lineTo(settlementX - 4, settlementPriceY + 3);
          ctx.lineTo(settlementX + 4, settlementPriceY + 3);
        } else {
          // 向下三角形
          ctx.moveTo(settlementX, settlementPriceY + 5);
          ctx.lineTo(settlementX - 4, settlementPriceY - 3);
          ctx.lineTo(settlementX + 4, settlementPriceY - 3);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 连接买入点和结算点的线
        ctx.strokeStyle = changeColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(startX, entryPriceY);
        ctx.lineTo(settlementX, settlementPriceY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 绘制价格标签 - 修复：让价格文字在色块内居中
      const priceText = trade.entryPrice.toFixed(1);

      // 计算文字宽度以确定标签大小
      ctx.font = 'bold 10px Arial';
      const textWidth = ctx.measureText(priceText).width;
      const labelWidth = Math.max(50, textWidth + 16); // 最小50px，或文字宽度+16px padding
      const labelHeight = 20;
      const radius = 8;

      // 标签位置：从买入点右侧开始，确保有足够间距
      const labelX = startX + baseRadius + 10;
      const labelY = entryPriceY;

      // 标签背景 - 手动绘制圆角矩形
      ctx.fillStyle = mainColor;
      ctx.beginPath();
      ctx.moveTo(labelX + radius, labelY - labelHeight/2);
      ctx.lineTo(labelX + labelWidth - radius, labelY - labelHeight/2);
      ctx.quadraticCurveTo(labelX + labelWidth, labelY - labelHeight/2, labelX + labelWidth, labelY - labelHeight/2 + radius);
      ctx.lineTo(labelX + labelWidth, labelY + labelHeight/2 - radius);
      ctx.quadraticCurveTo(labelX + labelWidth, labelY + labelHeight/2, labelX + labelWidth - radius, labelY + labelHeight/2);
      ctx.lineTo(labelX + radius, labelY + labelHeight/2);
      ctx.quadraticCurveTo(labelX, labelY + labelHeight/2, labelX, labelY + labelHeight/2 - radius);
      ctx.lineTo(labelX, labelY - labelHeight/2 + radius);
      ctx.quadraticCurveTo(labelX, labelY - labelHeight/2, labelX + radius, labelY - labelHeight/2);
      ctx.closePath();
      ctx.fill();

      // 价格文字 - 在色块中心
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(priceText, labelX + labelWidth/2, labelY + 3);

      // 连接线
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX + baseRadius, entryPriceY);
      ctx.lineTo(labelX, labelY);
      ctx.stroke();

      // 绘制交点闪光小点 - 优化：流畅的闪光效果
      const intersectionX = settlementX;
      const intersectionY = entryPriceY;

      // 只在交易进行中时显示闪光效果
      if (!trade.settled) {
        // 使用更流畅的动画时间计算（基于requestAnimationFrame的currentTime）
        const animationTime = currentTime * 0.003; // 减慢动画速度，使其更流畅
        const pulseAlpha = 0.7 + 0.3 * Math.sin(animationTime); // 0.7-1.0之间平滑脉冲
        const pulseRadius = 3.5 + 1.5 * Math.sin(animationTime * 1.2); // 3.5-5px之间平滑脉冲
        const glowRadius = 6 + 2 * Math.sin(animationTime * 0.8); // 外圈光晕也有动画

        // 外圈光晕 - 更大的光晕效果
        const glowGradient = ctx.createRadialGradient(intersectionX, intersectionY, 0, intersectionX, intersectionY, glowRadius);
        glowGradient.addColorStop(0, trade.direction === 'up' ? `rgba(16, 185, 129, ${pulseAlpha * 0.6})` : `rgba(239, 68, 68, ${pulseAlpha * 0.6})`);
        glowGradient.addColorStop(0.7, trade.direction === 'up' ? `rgba(16, 185, 129, ${pulseAlpha * 0.3})` : `rgba(239, 68, 68, ${pulseAlpha * 0.3})`);
        glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(intersectionX, intersectionY, glowRadius, 0, 2 * Math.PI);
        ctx.fill();

        // 主闪光点
        ctx.fillStyle = trade.direction === 'up' ? `rgba(16, 185, 129, ${pulseAlpha})` : `rgba(239, 68, 68, ${pulseAlpha})`;
        ctx.beginPath();
        ctx.arc(intersectionX, intersectionY, pulseRadius, 0, 2 * Math.PI);
        ctx.fill();

        // 内部高亮点 - 添加轻微的偏移以增加立体感
        const highlightOffset = 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${pulseAlpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(intersectionX - highlightOffset, intersectionY - highlightOffset, pulseRadius * 0.35, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // 绘制时间轴标签 - 整个图表只显示7个时间标签
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';

    const now = Date.now();
    const timeSpan = 90000; // 90秒历史数据

    for (let i = 0; i < totalTimeLabels; i++) {
      const x = (totalChartWidth / (totalTimeLabels - 1)) * i;

      if (x <= historyZoneWidth) {
        // 左侧历史区域的时间标签（基于实时价格历史）
        const progress = x / historyZoneWidth;
        const timeFromStart = progress * timeSpan;
        const actualTime = now - timeSpan + timeFromStart;

        const time = new Date(actualTime);
        const timeStr = time.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        ctx.fillText(timeStr, x, height - 10);
      } else {
        // 右侧预测区域的时间标签
        const predictionProgress = (x - historyZoneWidth) / predictionZoneWidth;
        const futureTime = new Date(now + (30000 * predictionProgress)); // 30秒预测区
        const timeStr = futureTime.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        ctx.fillText(timeStr, x, height - 10);
      }
    }

  }, [data, currentPrice, activeTrades, dimensions, priceHistory, realTimePrices, currentTime]);

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
