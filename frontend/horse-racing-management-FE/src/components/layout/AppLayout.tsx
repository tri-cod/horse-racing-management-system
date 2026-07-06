import type { ReactNode } from 'react';
import AppHeader from './AppHeader';
import Sidebar from './Sidebar';
import PageTransition from './PageTransition';

export default function AppLayout({ children }: { children: ReactNode }) {
 return (
 <div className="flex min-h-screen bg-surface">
 <Sidebar />
 <div className="flex flex-1 flex-col ml-64">
 <AppHeader />
 <main id="main-content" className="flex-1 min-h-0">
 <PageTransition>{children}</PageTransition>
 </main>
 </div>
 </div>
 );
}
