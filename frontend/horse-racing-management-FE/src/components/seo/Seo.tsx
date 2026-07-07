import { useLocation } from 'react-router-dom';

const SITE_NAME = 'Royal Derby';
const DEFAULT_TITLE = 'Royal Derby — Horse Racing Management';
const DEFAULT_DESC = 'Royal Derby — manage races, horses, jockeys, results and betting in one platform.';

interface SeoProps {
 title?: string;
 description?: string;
 type?: string;
 image?: string;
}

// Lightweight SEO: sets document.title and meta tags without a heavy library
export default function Seo({ title, description, type = 'website' }: SeoProps) {
 const { pathname } = useLocation();

 const fullTitle = title ?`${title} · ${SITE_NAME}` : DEFAULT_TITLE;
 const desc = description ?? DEFAULT_DESC;
 const canonical = typeof window !== 'undefined' ?`${window.location.origin}${pathname}` : pathname;

 // Update document title on render
 if (typeof document !== 'undefined') {
 document.title = fullTitle;
 const setMeta = (name: string, content: string) => {
 let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
 if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el); }
 el.content = content;
 };
 const setProp = (prop: string, content: string) => {
 let el = document.querySelector<HTMLMetaElement>(`meta[property="${prop}"]`);
 if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el); }
 el.content = content;
 };
 setMeta('description', desc);
 setProp('og:title', fullTitle);
 setProp('og:description', desc);
 setProp('og:type', type);
 setProp('og:url', canonical);
 }

 return null;
}
