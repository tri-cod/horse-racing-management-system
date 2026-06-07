import Header from './header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="App">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
