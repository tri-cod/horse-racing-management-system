import type { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import PageTransition from './PageTransition';

export default function Layout({ children }: { children: ReactNode }) {
 return (
 <div className="flex min-h-screen flex-col bg-surface">
 <Header />
 <main id="main-content" className="flex-1 pt-[109px]">
 <PageTransition>{children}</PageTransition>
 </main>
 <Footer />
 </div>
 );
}
