import Header from './header';
import Footer from './Footer';
import PageTransition from './PageTransition';

export default function Layout({ children }) {
  return (
    <div className="App">
      <Header />
      <main id="main-content">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </div>
  );
}
