import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import Container from '@/components/ui/Container';

const ABOUT_LINKS = [
 { label: 'About Us', href: '/about' },
 { label: 'Rules', href: '/rules' },
 { label: 'Our Team', href: '/about#team' },
 { label: 'Contact', href: '/contact' },
];

const EXPLORE_LINKS = [
 { label: 'Race Schedule', href: '/races' },
 { label: 'Jockeys', href: '/jockeys' },
 { label: 'Horse Collection', href: '/horses' },
 { label: 'News', href: '/news' },
];

export default function Footer() {
 return (
 <footer className="bg-navy">
 {/* Brass rule at top */}
 <div className="h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
 <Container className="py-20">
 <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
 {/* Brand */}
 <div>
 <Link to="/" className="inline-block">
 <img src="/logopage.png" alt="Royal Derby" className="h-9 object-contain" />
 </Link>
 <p className="mt-4 text-sm leading-relaxed text-on-blue/70">
 An international-class horse racing arena — where champion jockeys, mighty steeds
 and unforgettable moments of the sport come together.
 </p>
 <ul className="mt-5 space-y-2">
 {[
 { Icon: MapPin, text: '285 W Huntington Dr, Arcadia, CA 91007' },
 { Icon: Phone, text: '0326 883 343' },
 { Icon: Mail, text: 'RoyalDerbyservice@gmail.com' },
 ].map(({ Icon, text }) => (
 <li key={text} className="flex items-start gap-2 text-sm text-on-blue/60">
 <Icon size={15} className="mt-0.5 shrink-0 text-gold" />
 <span>{text}</span>
 </li>
 ))}
 </ul>
 </div>

 <div>
 <h4 className="text-sm font-semibold text-on-blue">About Royal Derby</h4>
 <ul className="mt-4 space-y-2">
 {ABOUT_LINKS.map((item) => (
 <li key={item.href}>
 <Link to={item.href} className="text-sm text-on-blue/60 hover:text-gold transition-colors">
 {item.label}
 </Link>
 </li>
 ))}
 </ul>
 </div>

 <div>
 <h4 className="text-sm font-semibold text-on-blue">Explore</h4>
 <ul className="mt-4 space-y-2">
 {EXPLORE_LINKS.map((item) => (
 <li key={item.href}>
 <Link to={item.href} className="text-sm text-on-blue/60 hover:text-gold transition-colors">
 {item.label}
 </Link>
 </li>
 ))}
 </ul>
 </div>
 </div>

 <hr className="my-10 border-on-blue/10" />

 <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
 <p className="text-sm text-on-blue/40">
 &copy; {new Date().getFullYear()} Royal Derby. All rights reserved.
 </p>
 <div className="flex gap-5">
 <Link to="/privacy" className="text-sm text-on-blue/40 hover:text-on-blue/70 transition-colors">Privacy</Link>
 <Link to="/terms" className="text-sm text-on-blue/40 hover:text-on-blue/70 transition-colors">Terms</Link>
 </div>
 </div>
 </Container>
 </footer>
 );
}
