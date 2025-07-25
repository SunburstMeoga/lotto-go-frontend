import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from './hooks/useWeb3.jsx';
import { ErrorBoundary, Navbar, BottomNav, WalletModal } from './components';
import { PriceProvider } from './contexts/PriceContext';

function App() {
  const [showWalletModal, setShowWalletModal] = useState(false);
  const location = useLocation();
  const hideNavbar = ['/login', '/register'].includes(location.pathname);

  return (
    <Web3Provider>
      <PriceProvider>
        <ErrorBoundary>
          <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
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
            <WalletModal
              isOpen={showWalletModal}
              onClose={() => setShowWalletModal(false)}
            />
          </div>
        </ErrorBoundary>
      </PriceProvider>
    </Web3Provider>
  );
}

export default App;
