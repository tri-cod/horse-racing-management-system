import AppHeader from './AppHeader';
import Sidebar from './Sidebar';
import PageTransition from './PageTransition';
import ErrorBoundary from './ErrorBoundary';

export default function AppLayout({ children }) {
  return (
    <div className="App">
      <Sidebar />
      <div className="app-shell">
        <AppHeader />
        <main id="main-content" className="app-workspace">
          <ErrorBoundary>
            <PageTransition>{children}</PageTransition>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
