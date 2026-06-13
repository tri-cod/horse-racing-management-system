import HeroSection from '../components/home/HeroSection';
import AboutSection from '../components/home/AboutSection';
import StatsSection from '../components/home/StatsSection';
import RacesSection from '../components/home/RacesSection';
import HorsesSection from '../components/home/HorsesSection';
import JockeysSection from '../components/home/JockeysSection';
import GallerySection from '../components/home/GallerySection';
import NewsSection from '../components/home/NewsSection';
import NewsletterSection from '../components/home/NewsletterSection';

function HomePage() {
  return (
    <main className="home">
      <HeroSection />
      <AboutSection />
      <StatsSection />
      <RacesSection />
      <HorsesSection />
      <JockeysSection />
      <GallerySection />
      <NewsSection />
      <NewsletterSection />
    </main>
  );
}

export default HomePage;
