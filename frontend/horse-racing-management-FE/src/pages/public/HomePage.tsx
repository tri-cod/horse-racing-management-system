import { useEffect } from 'react';
import HeroSection from '@/components/features/home/HeroSection';
import AboutSection from '@/components/features/home/AboutSection';
import RacesSection from '@/components/features/home/RacesSection';
import JockeysSection from '@/components/features/home/JockeysSection';
import SeasonStatsSection from '@/components/features/home/SeasonStatsSection';
import GallerySection from '@/components/features/home/GallerySection';
import NewsSection from '@/components/features/home/NewsSection';
import NewsletterSection from '@/components/features/home/NewsletterSection';
import Seo from '@/components/seo/Seo';

export default function HomePage() {
  useEffect(() => {
    const id = 'org-jsonld';
    if (document.getElementById(id)) return;
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.id = id;
    s.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Organization', name: 'Royal Derby', url: window.location.origin },
        { '@type': 'WebSite', name: 'Royal Derby', url: window.location.origin },
      ],
    });
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  return (
    <div>
      <Seo title="Royal Derby — Horse Racing Management" description="Welcome to Royal Derby — the premier platform for managing horse races, jockeys, results and betting." type="website" />
      <HeroSection />
      <RacesSection />
      <SeasonStatsSection />
      <JockeysSection />
      <AboutSection />
      <GallerySection />
      <NewsSection />
      <NewsletterSection />
    </div>
  );
}