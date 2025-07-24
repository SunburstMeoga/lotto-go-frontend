import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from './hooks/useWeb3.jsx';
import { ErrorBoundary, Navbar, BottomNav } from './components';
import { PriceProvider } from './contexts/PriceContext';

function App() {
  const location = useLocation();
  const hideNavbar = ['/login', '/register'].includes(location.pathname);

  return (
    <Web3Provider>
      <PriceProvider>
        <ErrorBoundary>
          <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            {!hideNavbar && <Navbar />}
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
          </div>
        </ErrorBoundary>
      </PriceProvider>
    </Web3Provider>
  );
}

export default App;
