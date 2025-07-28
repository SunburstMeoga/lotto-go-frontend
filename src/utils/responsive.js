// 设计稿宽度
const DESIGN_WIDTH = 390;

// 获取当前视口宽度
const getViewportWidth = () => {
  return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
};

// 计算缩放比例
export const getScale = () => {
  const viewportWidth = getViewportWidth();

  // 如果视口宽度小于等于设计稿宽度，按比例缩放
  if (viewportWidth <= DESIGN_WIDTH) {
    return viewportWidth / DESIGN_WIDTH;
  }

  // 如果视口宽度大于设计稿宽度，保持1:1比例，不放大
  return 1;
};

// 将设计稿像素转换为实际像素
export const px = (designPx) => {
  const scale = getScale();
  return Math.round(designPx * scale);
};

// 将设计稿像素转换为rem单位（基于16px）
export const rem = (designPx) => {
  const scale = getScale();
  return (designPx * scale) / 16;
};

// 将设计稿像素转换为vw单位
export const vw = (designPx) => {
  return (designPx / DESIGN_WIDTH) * 100;
};

// 响应式样式对象
export const responsive = {
  // 容器样式 - PC端居中显示，移动端全宽
  container: {
    width: '100%',
    maxWidth: `${DESIGN_WIDTH}px`,
    margin: '0 auto',
    backgroundColor: 'var(--color-bg-primary)',
    minHeight: '100vh'
  },
  
  // 页面包装器 - 确保在PC端有黑色背景
  pageWrapper: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#000000',
    display: 'flex',
    justifyContent: 'center'
  }
};

// CSS变量设置函数
export const setResponsiveCSSVars = () => {
  const scale = getScale();
  const root = document.documentElement;
  
  root.style.setProperty('--scale', scale);
  root.style.setProperty('--design-width', `${DESIGN_WIDTH}px`);
  root.style.setProperty('--viewport-width', `${getViewportWidth()}px`);
};

// 初始化响应式设置
export const initResponsive = () => {
  setResponsiveCSSVars();
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    setResponsiveCSSVars();
  });
  
  // 监听设备方向变化
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      setResponsiveCSSVars();
    }, 100);
  });
};
