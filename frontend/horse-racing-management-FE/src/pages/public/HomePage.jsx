import { useEffect } from 'react';
import HeroSection from '../../components/home/HeroSection';
import AboutSection from '../../components/home/AboutSection';
import RacesSection from '../../components/home/RacesSection';
import FeaturedSection from '../../components/home/FeaturedSection';
import GallerySection from '../../components/home/GallerySection';
import NewsSection from '../../components/home/NewsSection';
import NewsletterSection from '../../components/home/NewsletterSection';
import Seo from '../../components/seo/Seo';

function HomePage() {
  /* inject JSON-LD via effect so it never interrupts React rendering */
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id   = 'org-jsonld';
    if (!document.getElementById('org-jsonld')) {
      script.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'Organization', name: 'Royal Derby', url: window.location.origin },
          { '@type': 'WebSite',      name: 'Royal Derby', url: window.location.origin },
        ],
      });
      document.head.appendChild(script);
    }
    return () => { document.getElementById('org-jsonld')?.remove(); };
  }, []);

  return (
    <div className="home">
      <Seo
        title="Royal Derby — Horse Racing Management"
        description="Welcome to Royal Derby — the premier platform for managing horse races, jockeys, results and betting."
        type="website"
      />
      <HeroSection />
      <RacesSection />
      <FeaturedSection />
      <AboutSection />
      <GallerySection />
      <NewsSection />
      <NewsletterSection />
    </div>
  );
}

export default HomePage;
