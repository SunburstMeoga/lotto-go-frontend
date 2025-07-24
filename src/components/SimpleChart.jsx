import { useState, useEffect, useRef } from 'react';

const SimpleChart = ({ data, currentPrice }) => {
  const canvasRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const parent = canvasRef.current.parentElement;
        setDimensions({
          width: parent.clientWidth,
          height: 400
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = dimensions;

    // 设置canvas尺寸
    canvas.width = width;
    canvas.height = height;

    // 清空画布
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // 计算价格范围
    const prices = data.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    const padding = priceRange * 0.1;

    // 绘制网格
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    
    // 水平网格线
    for (let i = 0; i <= 5; i++) {
      const y = (height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 垂直网格线
    for (let i = 0; i <= 10; i++) {
      const x = (width / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // 绘制K线
    const candleWidth = Math.max(2, (width / data.length) * 0.8);
    const candleSpacing = width / data.length;

    data.forEach((candle, index) => {
      const x = index * candleSpacing + candleSpacing / 2;
      
      // 计算Y坐标
      const openY = height - ((candle.open - minPrice + padding) / (priceRange + 2 * padding)) * height;
      const closeY = height - ((candle.close - minPrice + padding) / (priceRange + 2 * padding)) * height;
      const highY = height - ((candle.high - minPrice + padding) / (priceRange + 2 * padding)) * height;
      const lowY = height - ((candle.low - minPrice + padding) / (priceRange + 2 * padding)) * height;

      const isGreen = candle.close > candle.open;
      
      // 绘制影线
      ctx.strokeStyle = isGreen ? '#4bffb5' : '#ff4976';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // 绘制实体
      ctx.fillStyle = isGreen ? '#4bffb5' : '#ff4976';
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.abs(closeY - openY);
      
      if (bodyHeight < 1) {
        // 十字星
        ctx.fillRect(x - candleWidth / 2, bodyTop - 0.5, candleWidth, 1);
      } else {
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      }
    });

    // 绘制当前价格线
    if (currentPrice) {
      const priceY = height - ((currentPrice - minPrice + padding) / (priceRange + 2 * padding)) * height;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, priceY);
      ctx.lineTo(width, priceY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 价格标签
      ctx.fillStyle = '#fbbf24';
      ctx.font = '12px Arial';
      ctx.fillText(`$${currentPrice.toFixed(2)}`, width - 80, priceY - 5);
    }

    // 绘制价格刻度
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Arial';
    for (let i = 0; i <= 5; i++) {
      const price = maxPrice + padding - (i / 5) * (priceRange + 2 * padding);
      const y = (height / 5) * i;
      ctx.fillText(`$${price.toFixed(0)}`, 5, y + 15);
    }

  }, [data, currentPrice, dimensions]);

  return (
    <div className="w-full h-96 bg-gray-900 rounded-lg overflow-hidden relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
      <div className="absolute top-4 left-4 text-white">
        <div className="text-sm font-medium">BTC-USD</div>
        <div className="text-lg font-bold text-yellow-400">
          ${currentPrice?.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default SimpleChart;
