import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import Button from '../ui/Button';
import '../../assets/css/home/HeroSection.css';

import heroImg1 from '../../assets/img/ee63a717-b5ff-41b1-ad51-860da474eb55.jpg';
import heroImg2 from '../../assets/img/174b40b7b0643c6cdafe82f318879afd.webp';
import heroImg3 from '../../assets/img/venue-santaanita.webp';

const SLIDES = [heroImg1, heroImg2, heroImg3];
const AUTOPLAY_MS = 5000;

export default function HeroSection() {
  const [current, setCurrent] = useState(0);

  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length),
    []
  );
  const next = useCallback(
    () => setCurrent((c) => (c + 1) % SLIDES.length),
    []
  );

  useEffect(() => {
    const timer = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="home-hero">
      {SLIDES.map((src, i) => (
        <div key={i} className={`home-hero__slide${i === current ? ' active' : ''}`}>
          <img src={src} alt="Royal Derby racing" className="home-hero__img" />
        </div>
      ))}
      <div className="home-hero__overlay" />

      <div className="home-hero__content">
        <p className="eyebrow home-hero__eyebrow">Royal Derby 2026</p>
        <h1 className="home-hero__title">Glory On The Racetrack</h1>
        <p className="home-hero__subtitle">
          Where the proudest steeds and the most talented jockeys come together
          to compete in Royal Derby — a world-class horse racing tournament.
        </p>
        <div className="home-hero__actions">
          <Button as={Link} to="/races" variant="primary" size="lg">View Race Schedule</Button>
          <Button as={Link} to="/register" variant="outline" size="lg" className="home-hero__btn-outline">
            Join Now
          </Button>
        </div>
      </div>

      <button className="home-hero__arrow home-hero__arrow--left" onClick={prev} aria-label="Previous slide">
        <ChevronLeft size={22} />
      </button>
      <button className="home-hero__arrow home-hero__arrow--right" onClick={next} aria-label="Next slide">
        <ChevronRight size={22} />
      </button>

      <div className="home-hero__dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`home-hero__dot${i === current ? ' active' : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      <div className="home-hero__scroll">
        <ChevronDown size={24} />
      </div>
    </section>
  );
}
