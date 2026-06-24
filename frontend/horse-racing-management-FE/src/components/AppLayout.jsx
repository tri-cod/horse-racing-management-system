import AppHeader from './AppHeader';
import Sidebar from './Sidebar';
import PageTransition from './PageTransition';

export default function AppLayout({ children }) {
  return (
    <div className="App">
      <Sidebar />
      <div className="app-shell">
        <AppHeader />
        <main id="main-content" className="app-workspace">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
