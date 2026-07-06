import { Globe, Camera, Video, MessageCircle, MapPin, Phone, Mail } from 'lucide-react';
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

const SOCIALS = [
 { label: 'Facebook', href: '#', Icon: Globe },
 { label: 'Instagram', href: '#', Icon: Camera },
 { label: 'Youtube', href: '#', Icon: Video },
 { label: 'Twitter', href: '#', Icon: MessageCircle },
];

export default function Footer() {
 return (
 <footer className="bg-navy">
 {/* Brass rule at top */}
 <div className="h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
 <Container className="py-20">
 <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
 {/* Brand */}
 <div className="lg:col-span-1">
 <a href="/" className="inline-block">
 <img src="/logopage.png" alt="Royal Derby" className="h-9 object-contain" />
 </a>
 <p className="mt-4 text-sm leading-relaxed text-on-blue/70">
 An international-class horse racing arena — where champion jockeys, mighty steeds
 and unforgettable moments of the sport come together.
 </p>
 <ul className="mt-5 space-y-2">
 {[
 { Icon: MapPin, text: '285 W Huntington Dr, Arcadia, CA 91007' },
 { Icon: Phone, text: '+84 28 1234 5678' },
 { Icon: Mail, text: 'contact@royalderby.vn' },
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
 <a href={item.href} className="text-sm text-on-blue/60 hover:text-gold transition-colors">
 {item.label}
 </a>
 </li>
 ))}
 </ul>
 </div>

 <div>
 <h4 className="text-sm font-semibold text-on-blue">Explore</h4>
 <ul className="mt-4 space-y-2">
 {EXPLORE_LINKS.map((item) => (
 <li key={item.href}>
 <a href={item.href} className="text-sm text-on-blue/60 hover:text-gold transition-colors">
 {item.label}
 </a>
 </li>
 ))}
 </ul>
 </div>

 <div>
 <h4 className="text-sm font-semibold text-on-blue">Follow Us</h4>
 <div className="mt-4 flex gap-2">
 {SOCIALS.map(({ label, href, Icon }) => (
 <a key={label} href={href} aria-label={label}
 className="flex h-9 w-9 items-center justify-center border border-on-blue/20 text-on-blue/50 hover:border-gold hover:text-gold transition-colors">
 <Icon size={16} />
 </a>
 ))}
 </div>
 </div>
 </div>

 <hr className="my-10 border-on-blue/10" />

 <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
 <p className="text-sm text-on-blue/40">
 &copy; {new Date().getFullYear()} Royal Derby. All rights reserved.
 </p>
 <div className="flex gap-5">
 <a href="/privacy" className="text-sm text-on-blue/40 hover:text-on-blue/70 transition-colors">Privacy</a>
 <a href="/terms" className="text-sm text-on-blue/40 hover:text-on-blue/70 transition-colors">Terms</a>
 </div>
 </div>
 </Container>
 </footer>
 );
}
