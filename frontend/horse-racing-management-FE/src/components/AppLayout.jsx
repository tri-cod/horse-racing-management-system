import AppHeader from './AppHeader';
import Sidebar from './Sidebar';
import PageTransition from './PageTransition';

export default function AppLayout({ children }) {
  return (
    <div className="App">
      <AppHeader />
      <Sidebar />
      <div style={{ marginLeft: '60px' }}>
        <PageTransition>{children}</PageTransition>
      </div>
    </div>
  );
}
