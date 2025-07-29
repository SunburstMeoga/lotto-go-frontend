import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from './hooks/useWeb3.jsx';
import { ErrorBoundary, Navbar, BottomNav, WalletModalManager, DailyClaimModal, ChainChecker } from './components';
import { PriceProvider } from './contexts/PriceContext';
import { initResponsive, responsive } from './utils/responsive';

function App() {
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showDailyClaimModal, setShowDailyClaimModal] = useState(false);
  const location = useLocation();
  const hideNavbar = ['/login', '/register'].includes(location.pathname);

  // 检查是否是需要全屏布局的页面
  const isFullScreenPage = location.pathname === '/' || location.pathname === '/trading' || location.pathname === '/history' || location.pathname === '/account';

  // 初始化响应式设计
  useEffect(() => {
    initResponsive();
  }, []);

  // 每次刷新页面时显示每日领取弹窗
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDailyClaimModal(true);
    }, 1000); // 延迟1秒显示，确保页面加载完成

    return () => clearTimeout(timer);
  }, []);

  // 主要页面使用全屏布局
  if (isFullScreenPage) {
    return (
      <Web3Provider>
        <PriceProvider>
          <ErrorBoundary>
            <ChainChecker>
              <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                {!hideNavbar && <Navbar onWalletModalOpen={() => setShowWalletModal(true)} />}
                <main className={hideNavbar ? '' : 'mobile-container'} style={{ paddingTop: hideNavbar ? '0' : '64px' }}>
                  <Outlet />
                </main>
                {!hideNavbar && <BottomNav />}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    style: {
                      background: 'var(--color-bg-secondary)',
                      color: 'var(--color-text-primary)',
                      border: '1px solid var(--color-border)'
                    }
                  }}
                />
                {/* 钱包弹窗 - 在App级别，不受其他组件限制 */}
                <WalletModalManager
                  isOpen={showWalletModal}
                  onClose={() => setShowWalletModal(false)}
                />
                {/* 每日领取弹窗 */}
                <DailyClaimModal
                  isOpen={showDailyClaimModal}
                  onClose={() => setShowDailyClaimModal(false)}
                />
              </div>
            </ChainChecker>
          </ErrorBoundary>
        </PriceProvider>
      </Web3Provider>
    );
  }

  // 其他页面使用响应式布局
  return (
    <Web3Provider>
      <PriceProvider>
        <ErrorBoundary>
          <ChainChecker>
            {/* PC端黑色背景包装器 */}
            <div style={responsive.pageWrapper}>
              {/* 移动端容器 */}
              <div style={responsive.container}>
                {!hideNavbar && <Navbar onWalletModalOpen={() => setShowWalletModal(true)} />}
                <main className={hideNavbar ? '' : ''}>
                  <Outlet />
                </main>
                {!hideNavbar && <BottomNav />}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    style: {
                      background: 'var(--color-bg-secondary)',
                      color: 'var(--color-text-primary)',
                      border: '1px solid var(--color-border)'
                    }
                  }}
                />
                {/* 钱包弹窗 - 在App级别，不受其他组件限制 */}
                <WalletModalManager
                  isOpen={showWalletModal}
                  onClose={() => setShowWalletModal(false)}
                />
                {/* 每日领取弹窗 */}
                <DailyClaimModal
                  isOpen={showDailyClaimModal}
                  onClose={() => setShowDailyClaimModal(false)}
                />
              </div>
            </div>
          </ChainChecker>
        </ErrorBoundary>
      </PriceProvider>
    </Web3Provider>
  );
}

export default App;
