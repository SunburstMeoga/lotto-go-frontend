import { useState, useEffect, useRef } from 'react';

const useScrollDirection = (threshold = 30) => {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;

      // 如果滚动到顶部，始终显示顶部栏
      if (scrollY <= 10) {
        setIsVisible(true);
        lastScrollY.current = scrollY;
        ticking.current = false;
        return;
      }

      // 计算滚动距离
      const scrollDelta = scrollY - lastScrollY.current;

      // 如果滚动距离超过阈值
      if (Math.abs(scrollDelta) >= threshold) {
        if (scrollDelta > 0) {
          // 向下滚动 - 隐藏顶部栏
          setIsVisible(false);
        } else {
          // 向上滚动 - 显示顶部栏
          setIsVisible(true);
        }
        lastScrollY.current = scrollY;
      }

      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(updateScrollDirection);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [threshold]);

  return { isVisible };
};

export default useScrollDirection;
