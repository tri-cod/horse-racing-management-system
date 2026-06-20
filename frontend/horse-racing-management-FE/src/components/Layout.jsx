import Header from './header';
import Footer from './Footer';
import PageTransition from './PageTransition';

export default function Layout({ children }) {
  return (
    <div className="App">
      <Header />
      <PageTransition>{children}</PageTransition>
      <Footer />
    </div>
  );
}
