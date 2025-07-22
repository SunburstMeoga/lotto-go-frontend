import { Outlet, useLocation } from 'react-router-dom';
import { ErrorBoundary, Navbar, ToastContainer } from './components';

function App() {
  const location = useLocation();
  const hideNavbar = ['/login', '/register'].includes(location.pathname);

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        {!hideNavbar && <Navbar />}
        <main className={hideNavbar ? '' : 'pt-0'}>
          <Outlet />
        </main>
        <ToastContainer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
