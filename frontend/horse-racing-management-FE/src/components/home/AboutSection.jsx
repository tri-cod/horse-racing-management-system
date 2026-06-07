import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from '../ui/Container';
import '../../assets/css/home/AboutSection.css';

import aboutImg1 from '../../assets/img/venue-santaanita.webp';
import aboutImg2 from '../../assets/img/8adf38de12946d77086ff9a58cc5b2f1.jpg';
import aboutImg3 from '../../assets/img/174b40b7b0643c6cdafe82f318879afd.webp';

const SLIDES = [aboutImg1, aboutImg2, aboutImg3];

export default function AboutSection() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % SLIDES.length), []);

  useEffect(() => {
    const timer = setInterval(next, 4500);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="home-about">
      <Container>
        <div className="home-about__grid">
          <div className="home-about__text">
            <p className="eyebrow">About Royal Derby</p>
            <h2 className="home-about__title">A World-Class Horse Racing Tournament</h2>
            <p className="home-about__paragraph">
              Royal Derby is a horse racing arena that brings together purebred
              champions and outstanding jockeys from all over the world. Every season
              is a journey celebrating speed, courage and the spirit of fair competition.
            </p>
            <p className="home-about__paragraph">
              From thrilling qualifying heats to spectacular finals, Royal Derby
              delivers a premium experience for spectators, owners, trainers and
              jockeys alike — connecting a community of racing enthusiasts on a
              modern, transparent management platform.
            </p>
            <Link to="/about" className="home-about__link">Learn more →</Link>
          </div>

          <div className="home-about__media">
            {SLIDES.map((src, i) => (
              <img
                key={i}
                src={src}
                alt="A moment from Royal Derby"
                className={`home-about__img${i === current ? ' active' : ''}`}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
