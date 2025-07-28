import { useState, useEffect, useRef } from 'react';

const TradingChart = ({ data, currentPrice, activeTrades, chartType = 'candlestick' }) => {
  const canvasRef = useRef();
  const animationFrameRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [priceHistory, setPriceHistory] = useState(() => {
    // 基于图表的时间范围初始化历史数据点
    const now = Date.now();
    const timeSpan = 90000; // 90秒历史数据
    const intervalMs = 1000; // 每1秒一个点，与实际更新频率一致
    const pointCount = Math.floor(timeSpan / intervalMs); // 90个点

    const initialHistory = [];
    for (let i = pointCount; i >= 0; i--) {
      initialHistory.push({
        time: now - (i * intervalMs), // 每1秒一个点，往前90秒
        price: currentPrice + (Math.random() - 0.5) * currentPrice * 0.01 // 在当前价格基础上小幅波动
      });
    }
    return initialHistory;
  });
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

  // 当currentPrice变化时，更新价格历史
  useEffect(() => {
    const now = Date.now();

    // 更新价格历史（用于左侧1分30秒真实走势）
    setPriceHistory(prev => {
      const newHistory = [...prev, { time: now, price: currentPrice }];
      // 只保留最近90秒的数据
      const filtered = newHistory.filter(item => now - item.time < 90000);
      return filtered;
    });

    // 更新实时价格数据（用于右侧预测区的实时价格线）
    setRealTimePrices(prev => {
      const newPrices = [...prev, { time: now, price: currentPrice }];
      // 只保留最近30秒的数据（预测区时间范围）
      return newPrices.filter(item => now - item.time < 30000);
    });
  }, [currentPrice]);

  // 使用requestAnimationFrame实现流畅的动画更新（仅用于动画效果）
  useEffect(() => {
    const animate = (timestamp) => {
      setCurrentTime(timestamp);
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
    ctx.fillStyle = '#8A7D6A';
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
      // 创建折线渐变色
      const lineGradient = ctx.createLinearGradient(0, 0, historyZoneWidth, 0);
      lineGradient.addColorStop(0, '#D25868');
      lineGradient.addColorStop(0.2, '#CECFF7');
      lineGradient.addColorStop(0.4, '#C290E4');
      lineGradient.addColorStop(0.6, '#D25868');
      lineGradient.addColorStop(0.8, '#C290E4');
      lineGradient.addColorStop(1, '#78C9C9');

      ctx.strokeStyle = lineGradient;
      ctx.lineWidth = 2; // 增加线宽到2px，更平滑
      ctx.lineCap = 'round'; // 圆角线条
      ctx.lineJoin = 'round'; // 圆角连接
      ctx.beginPath();

      const now = Date.now();
      const timeSpan = 90000; // 90秒历史数据

      // 过滤有效的价格历史点
      const validPoints = priceHistory.filter(point => {
        const timeFromStart = point.time - (now - timeSpan);
        return timeFromStart >= 0;
      });

      if (validPoints.length > 1) {
        // 使用贝塞尔曲线绘制更平滑的线条
        const points = validPoints.map(point => {
          const timeFromStart = point.time - (now - timeSpan);
          const timeProgress = timeFromStart / timeSpan;
          const x = timeProgress * historyZoneWidth;
          const y = chartTop + chartHeight - ((point.price - minPrice + padding) / (priceRange + 2 * padding)) * chartHeight;
          return { x, y };
        });

        // 开始绘制平滑曲线
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length - 1; i++) {
          const currentPoint = points[i];
          const nextPoint = points[i + 1];

          // 计算控制点，使曲线更平滑
          const controlPointX = currentPoint.x + (nextPoint.x - currentPoint.x) * 0.5;
          const controlPointY = currentPoint.y;

          ctx.quadraticCurveTo(controlPointX, controlPointY,
                              currentPoint.x + (nextPoint.x - currentPoint.x) * 0.5,
                              currentPoint.y + (nextPoint.y - currentPoint.y) * 0.5);
        }

        // 绘制最后一段
        if (points.length > 1) {
          const lastPoint = points[points.length - 1];
          const secondLastPoint = points[points.length - 2];
          ctx.quadraticCurveTo(secondLastPoint.x, secondLastPoint.y, lastPoint.x, lastPoint.y);
        }

        ctx.stroke();
      }

      // 添加折线图下方的渐变填充
      if (validPoints.length > 0) {
        ctx.save();

        // 创建渐变（从折线到底部）- 按照新的颜色规范
        const gradient = ctx.createLinearGradient(0, chartTop, 0, chartTop + chartHeight);
        gradient.addColorStop(0.12, 'rgba(99, 103, 149, 0.94)'); // At 12%, use #636795 with 94% opacity
        gradient.addColorStop(0.54, 'rgba(246, 161, 156, 0.27)'); // At 54%, use #F6A19C with 27% opacity
        gradient.addColorStop(1, 'rgba(246, 161, 156, 0)'); // At 100%, use #F6A19C with 0% opacity

        ctx.fillStyle = gradient;
        ctx.beginPath();

        // 重新绘制折线路径用于填充
        let isFirstFillPoint = true;
        validPoints.forEach((point) => {
          const timeFromStart = point.time - (now - timeSpan);
          const timeProgress = timeFromStart / timeSpan;
          const x = timeProgress * historyZoneWidth;
          const y = chartTop + chartHeight - ((point.price - minPrice + padding) / (priceRange + 2 * padding)) * chartHeight;

          if (isFirstFillPoint) {
            ctx.moveTo(x, y);
            isFirstFillPoint = false;
          } else {
            ctx.lineTo(x, y);
          }
        });

        // 连接到底部形成封闭区域
        if (validPoints.length > 0) {
          const lastPoint = validPoints[validPoints.length - 1];
          const firstPoint = validPoints[0];

          const lastTimeProgress = (lastPoint.time - (now - timeSpan)) / timeSpan;
          const firstTimeProgress = (firstPoint.time - (now - timeSpan)) / timeSpan;
          const lastX = lastTimeProgress * historyZoneWidth;
          const firstX = firstTimeProgress * historyZoneWidth;

          ctx.lineTo(lastX, chartTop + chartHeight); // 右下角
          ctx.lineTo(firstX, chartTop + chartHeight); // 左下角
          ctx.closePath();
        }

        ctx.fill();
        ctx.restore();
      }

      // 不再显示历史数据点，只保留线条
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
        ctx.strokeStyle = isGreen ? '#10D184' : '#BD2338';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // 绘制实体
        ctx.fillStyle = isGreen ? '#10D184' : '#BD2338';
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
    // 确定当前价格值 - 优先使用折线图最新点的价格以确保同步
    let currentPriceValue = currentPriceRef.current;
    let currentPriceX = historyZoneWidth; // 默认在历史区域右边界

    if (chartType === 'line' && priceHistory.length > 0) {
      // 折线图模式：当前价格点必须与折线图的最新点位置完全一致
      const now = Date.now();
      const timeSpan = 90000; // 90秒历史数据

      // 使用与折线图完全相同的过滤和计算逻辑
      const validPoints = priceHistory.filter(point => {
        const timeFromStart = point.time - (now - timeSpan);
        return timeFromStart >= 0;
      });

      if (validPoints.length > 0) {
        const latestPoint = validPoints[validPoints.length - 1];
        const timeFromStart = latestPoint.time - (now - timeSpan);
        const timeProgress = timeFromStart / timeSpan;
        currentPriceX = timeProgress * historyZoneWidth;

        // 确保当前价格与历史数据中的最新价格一致，这样光点和折线图完全同步
        currentPriceValue = latestPoint.price;
      }
    } else if (data && data.length > 0) {
      // K线图模式：计算最新数据点的X位置
      const candleSpacing = historyZoneWidth / data.length;
      currentPriceX = (data.length - 1) * candleSpacing + candleSpacing / 2;
    }

    const priceY = chartTop + chartHeight - ((currentPriceValue - minPrice + padding) / (priceRange + 2 * padding)) * chartHeight;

    // 当前价位横虚线（延伸到整个图表区域包括预测区）
    ctx.strokeStyle = '#CBAD83';
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

    // 白色光圈效果（外圈阴影）
    const glowGradient = ctx.createRadialGradient(currentPriceX, priceY, 0, currentPriceX, priceY, pulseRadius + 8);
    glowGradient.addColorStop(0, `rgba(255, 255, 255, ${pulseAlpha * 0.6})`);
    glowGradient.addColorStop(0.5, `rgba(255, 255, 255, ${pulseAlpha * 0.3})`);
    glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(currentPriceX, priceY, pulseRadius + 8, 0, 2 * Math.PI);
    ctx.fill();

    // 中圈白色光晕
    const midGlowGradient = ctx.createRadialGradient(currentPriceX, priceY, 0, currentPriceX, priceY, pulseRadius + 4);
    midGlowGradient.addColorStop(0, `rgba(255, 255, 255, ${pulseAlpha * 0.8})`);
    midGlowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = midGlowGradient;
    ctx.beginPath();
    ctx.arc(currentPriceX, priceY, pulseRadius + 4, 0, 2 * Math.PI);
    ctx.fill();

    // 主实心圆（白色）
    ctx.fillStyle = `rgba(255, 255, 255, ${pulseAlpha})`;
    ctx.beginPath();
    ctx.arc(currentPriceX, priceY, pulseRadius, 0, 2 * Math.PI);
    ctx.fill();

    // 内部高亮点（更亮的白色）
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, pulseAlpha * 1.2)})`;
    ctx.beginPath();
    ctx.arc(currentPriceX, priceY, pulseRadius * 0.5, 0, 2 * Math.PI);
    ctx.fill();

    // 计算价格文字宽度
    const priceText = currentPriceValue.toFixed(1);
    ctx.font = 'bold 11px Arial';
    const textWidth = ctx.measureText(priceText).width;
    const labelWidth = textWidth + 16; // 左右各8px padding
    const labelHeight = 20;
    const labelX = totalChartWidth + 5; // 紧贴图表右边

    // 绘制圆角价格标签背景
    ctx.fillStyle = '#CBAD83';
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
      const now = Date.now();
      const timeSpan = 90000; // 90秒历史数据

      // 检查买入点是否还在显示范围内（基于90秒历史范围）
      const tradeTimeFromStart = tradeStartTime - (now - timeSpan);

      // 如果买入时间已经超出历史范围，整个交易都不显示
      if (tradeTimeFromStart < 0) {
        return;
      }

      // 修复：计算买入点在实时价格历史轨迹上的准确位置

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
        mainColor = isWin ? '#10D184' : '#BD2338';
      } else {
        // 进行中：显示方向
        mainColor = isUp ? '#10D184' : '#BD2338';
      }



      // 买入点使用固定大小，缩小一半
      const baseRadius = 6;

      // 计算结算线位置 - 从最右边开始向左移动，按秒为单位
      const tradeElapsedTime = now - tradeStartTime; // 交易已经过去的时间
      const tradeDuration = 60000; // 1分钟交易时长
      const remainingTime = tradeDuration - tradeElapsedTime; // 剩余时间

      let settlementX;

      if (remainingTime > 0) {
        // 交易进行中：结算线从图表最右边向左移动
        // 按秒为单位计算位置，避免每帧都移动
        const elapsedSeconds = Math.floor(tradeElapsedTime / 1000); // 已过去的秒数
        const totalSeconds = 60; // 总共60秒
        const timeProgress = elapsedSeconds / totalSeconds; // 0到1的进度，按秒计算
        const totalDistance = totalChartWidth - historyZoneWidth; // 需要移动的总距离
        settlementX = totalChartWidth - (timeProgress * totalDistance); // 从最右边向左移动
      } else {
        // 交易结算：结算线到达历史区域右边界
        settlementX = historyZoneWidth;
      }

      // 只在交易进行中且在开盘时间内显示结算时间线和连接线
      const isWithinTradingTime = now < tradeEndTime; // 使用实际时间而不是动画时间戳

      if (!isSettled && isWithinTradingTime) {
        // 绘制买入点和结算竖线之间的连接线 - 颜色根据up/down决定
        ctx.strokeStyle = trade.direction === 'up' ? '#10D184' : '#BD2338';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(startX, entryPriceY);
        ctx.lineTo(settlementX, entryPriceY);
        ctx.stroke();

        // 绘制结算时间虚线 - 固定颜色 #CBAD83，从交易提交开始就往左边移动
        ctx.strokeStyle = '#CBAD83';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(settlementX, chartTop);
        ctx.lineTo(settlementX, chartTop + chartHeight);
        ctx.stroke();
        ctx.setLineDash([]);

        // 绘制买入点和结算竖线的相交点 - 圆点，颜色根据up/down决定
        const intersectionX = settlementX;
        const intersectionY = entryPriceY;
        const intersectionRadius = 4;

        // 绘制相交点圆形
        ctx.fillStyle = trade.direction === 'up' ? '#10D184' : '#BD2338';
        ctx.beginPath();
        ctx.arc(intersectionX, intersectionY, intersectionRadius, 0, 2 * Math.PI);
        ctx.fill();

        // 绘制相交点边框
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(intersectionX, intersectionY, intersectionRadius, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // 只在交易进行中且在开盘时间内绘制买入点
      if (!isSettled && isWithinTradingTime) {
        // 绘制外圈光晕
        const gradient = ctx.createRadialGradient(startX, entryPriceY, 0, startX, entryPriceY, baseRadius + 8);
        gradient.addColorStop(0, trade.direction === 'up' ? 'rgba(16, 209, 132, 0.3)' : 'rgba(189, 35, 56, 0.3)');
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

        // 绘制白色三角形图标
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (isUp) {
          // 向上三角形 - 调整大小适应小圆圈
          ctx.moveTo(startX, entryPriceY - 4);
          ctx.lineTo(startX - 3, entryPriceY + 2);
          ctx.lineTo(startX + 3, entryPriceY + 2);
        } else {
          // 向下三角形 - 调整大小适应小圆圈
          ctx.moveTo(startX, entryPriceY + 4);
          ctx.lineTo(startX - 3, entryPriceY - 2);
          ctx.lineTo(startX + 3, entryPriceY - 2);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // 如果交易已结算，在折线图上显示结算信息
      if (isSettled) {
        console.log('显示结算信息:', trade.id, 'settlementTime:', trade.settlementTime);

        // 使用已保存的结算价格，确保稳定显示不闪烁
        const settlementPrice = trade.settlementPrice || trade.entryPrice;

        // 计算结算点在折线图上的位置 - 使用结算时间
        const currentTime = Date.now();
        const historyTimeSpan = 90000; // 90秒历史数据
        const settlementTimeFromStart = trade.settlementTime - (currentTime - historyTimeSpan);
        let settlementX;

        console.log('结算时间计算:', {
          currentTime,
          settlementTime: trade.settlementTime,
          settlementTimeFromStart,
          historyTimeSpan
        });

        // 如果结算时间还在历史范围内，计算准确位置
        if (settlementTimeFromStart >= 0 && settlementTimeFromStart <= historyTimeSpan) {
          const timeProgress = settlementTimeFromStart / historyTimeSpan;
          settlementX = timeProgress * historyZoneWidth;
          console.log('结算信息显示在:', settlementX);
        } else if (settlementTimeFromStart < 0) {
          // 结算时间已经超出历史范围，不显示结算信息（与买入点消失逻辑一致）
          console.log('结算时间超出范围，不显示');
          return;
        } else {
          // 结算时间在未来（不应该发生），默认在右边界
          settlementX = historyZoneWidth;
          console.log('结算时间在未来，显示在右边界');
        }

        // Y位置：基于结算价格
        const settlementPriceY = chartTop + chartHeight - ((settlementPrice - minPrice + padding) / (priceRange + 2 * padding)) * chartHeight;

        // 结算点绘制逻辑

        // 绘制结算点 - 圆形背景色根据up/down决定
        const settlementRadius = 8;
        ctx.fillStyle = trade.direction === 'up' ? '#10D184' : '#BD2338';
        ctx.beginPath();
        ctx.arc(settlementX, settlementPriceY, settlementRadius, 0, 2 * Math.PI);
        ctx.fill();

        // 绘制结算点边框
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(settlementX, settlementPriceY, settlementRadius, 0, 2 * Math.PI);
        ctx.stroke();

        // 绘制中间的黑色三角形
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        if (trade.direction === 'up') {
          // 向上三角形
          ctx.moveTo(settlementX, settlementPriceY - 4);
          ctx.lineTo(settlementX - 3, settlementPriceY + 2);
          ctx.lineTo(settlementX + 3, settlementPriceY + 2);
        } else {
          // 向下三角形
          ctx.moveTo(settlementX, settlementPriceY + 4);
          ctx.lineTo(settlementX - 3, settlementPriceY - 2);
          ctx.lineTo(settlementX + 3, settlementPriceY - 2);
        }
        ctx.closePath();
        ctx.fill();

        // 绘制pill-style的badge标签
        const profitLoss = trade.profit !== undefined ? trade.profit : (trade.amount || 10);
        const profitText = Math.abs(profitLoss).toFixed(1);

        // Pill badge尺寸
        const badgeHeight = 28;
        const textPadding = 12;
        const iconSize = 20;
        const badgeTextWidth = ctx.measureText(profitText).width + textPadding * 2;
        const badgeWidth = badgeTextWidth + iconSize;
        const badgeX = settlementX - settlementRadius - badgeWidth - 10;
        const badgeY = settlementPriceY;

        // 根据买入方向决定颜色（绿色/红色）
        const badgeColor = trade.direction === 'up' ? '#10D184' : '#EF4444';
        const textColor = '#000000'; // 黑色文字

        // 绘制pill形状背景
        ctx.fillStyle = badgeColor;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY - badgeHeight/2, badgeWidth, badgeHeight, badgeHeight/2);
        ctx.fill();

        // 绘制左侧数字文本
        ctx.fillStyle = textColor;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(profitText, badgeX + badgeTextWidth/2, badgeY + 4);

        // 绘制右侧圆形图标背景
        const iconCenterX = badgeX + badgeTextWidth + iconSize/2;
        const iconCenterY = badgeY;
        const iconRadius = iconSize/2 - 2;

        ctx.fillStyle = textColor;
        ctx.beginPath();
        ctx.arc(iconCenterX, iconCenterY, iconRadius, 0, 2 * Math.PI);
        ctx.fill();

        // 绘制图标内的三角形
        ctx.fillStyle = badgeColor;
        ctx.beginPath();
        const triangleSize = 6;
        if (trade.direction === 'up') {
          // 向上三角形
          ctx.moveTo(iconCenterX, iconCenterY - triangleSize/2);
          ctx.lineTo(iconCenterX - triangleSize/2, iconCenterY + triangleSize/2);
          ctx.lineTo(iconCenterX + triangleSize/2, iconCenterY + triangleSize/2);
        } else {
          // 向下三角形
          ctx.moveTo(iconCenterX, iconCenterY + triangleSize/2);
          ctx.lineTo(iconCenterX - triangleSize/2, iconCenterY - triangleSize/2);
          ctx.lineTo(iconCenterX + triangleSize/2, iconCenterY - triangleSize/2);
        }
        ctx.closePath();
        ctx.fill();

        // 连接线（从badge到结算点）
        ctx.strokeStyle = trade.direction === 'up' ? '#10D184' : '#EF4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(badgeX + badgeWidth, badgeY);
        ctx.lineTo(settlementX - settlementRadius, settlementPriceY);
        ctx.stroke();
      }




    });

    // 绘制时间轴标签 - 整个图表只显示7个时间标签
    ctx.fillStyle = '#8A7D6A';
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
