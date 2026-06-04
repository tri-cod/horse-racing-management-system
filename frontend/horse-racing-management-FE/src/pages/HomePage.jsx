import { useState, useCallback } from 'react';
import '../assets/css/HomePage.css';

import heroImg1 from '../assets/img/ee63a717-b5ff-41b1-ad51-860da474eb55.jpg';
import heroImg2 from '../assets/img/174b40b7b0643c6cdafe82f318879afd.webp';
import heroImg3 from '../assets/img/venue-santaanita.webp';
import venueImgTop  from '../assets/img/venue-santaanita.webp';
import venueImgBottom from '../assets/img/8adf38de12946d77086ff9a58cc5b2f1.jpg';

const SLIDES = [
  {
    img: heroImg1,
    title: 'Royal Derby Racing',
    desc: 'Experience the thrill of championship horse racing.\nManage, track, and celebrate excellence.',
  },
  {
    img: heroImg2,
    title: 'Champions Are Made Here',
    desc: 'Where legends compete and history is written on\nevery stretch of the track.',
  },
  {
    img: heroImg3,
    title: 'World Class Venues',
    desc: 'Race at iconic venues renowned for their prestige,\nbeauty, and electrifying atmosphere.',
  },
];

function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length),
    []
  );
  const next = useCallback(
    () => setCurrent((c) => (c + 1) % SLIDES.length),
    []
  );


  return (
    <section className="hero">
      {SLIDES.map((slide, i) => (
        <div key={i} className={`hero__slide${i === current ? ' active' : ''}`}>
          <img src={slide.img} alt={slide.title} className="hero__img" />
          <div className="hero__overlay" />
        </div>
      ))}

      <div className="hero__content">
        <h1 className="hero__title">{SLIDES[current].title}</h1>
        <p className="hero__desc">
          {SLIDES[current].desc.split('\n').map((line, i) => (
            <span key={i}>{line}<br /></span>
          ))}
        </p>
        <div className="hero__btns">
          <a href="/races"   className="hero__btn-primary">View Upcoming Races</a>
          <a href="/results" className="hero__btn-secondary">Live Results</a>
        </div>
      </div>

      <button className="hero__arrow hero__arrow--left" onClick={prev} aria-label="Previous">
        &#8249;
      </button>
      <button className="hero__arrow hero__arrow--right" onClick={next} aria-label="Next">
        &#8250;
      </button>

      <div className="hero__dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`hero__dot${i === current ? ' active' : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

function InnovationSection() {
  return (
    <section className="innovation">
      <div className="innovation__right">
        <img
          src={heroImg2}
          alt="Horse racing action"
          className="innovation__img"
        />
      </div>
      <div className="innovation__overlay" />
      <div className="innovation__left">
        <h2 className="innovation__title">
          <div className="innovation__title-line1">Innovating for</div>
          <div className="innovation__title-line2">the future</div>
        </h2>
        <a href="/tickets" className="innovation__btn">Buy ticket</a>
      </div>
    </section>
  );
}

function VenueSection() {
  return (
    <section className="venue">
      <div className="venue__inner">
        <div>
          <p className="venue__location">Arcadia, California · Est. 1934</p>
          <h2 className="venue__title">Santa Anita Park</h2>
          <p className="venue__subtitle">Nine Decades of Speed, Glory &amp; History</p>
          <p className="venue__text">
            Nestled at the foot of the San Gabriel Mountains, Santa Anita Park opened its gates on
            Christmas Day, 1934 — a bold act of optimism in the depths of the Great Depression.
            Designed by Gordon B. Kaufmann, the architect behind the Hoover Dam, the track was an
            instant masterpiece: a sweeping Art Deco grandstand surrounded by manicured gardens,
            palm trees, and the majestic California sky.
          </p>
          <blockquote className="venue__quote">
            "To walk into Santa Anita is to step into the living memory of American sport."
          </blockquote>
          <p className="venue__text">
            The early years gave birth to legends. Seabiscuit — America's beloved underdog champion
            — made Santa Anita his home track, thrilling depression-era crowds who desperately needed
            a hero. The roar of 85,527 fans on Big 'Cap Day in 1985 set an all-time attendance
            record that still stands. Over the decades, Hall of Fame jockeys Bill Shoemaker and
            Laffit Pincay Jr. wrote their careers into the dirt of this very track.
          </p>
          <p className="venue__text">
            But Santa Anita's story is not only one of triumph. During World War II, the track was
            transformed into the largest Japanese-American assembly center on the West Coast. Over
            19,000 men, women, and children — stripped of their homes and freedom — passed through
            these grounds before being sent to internment camps. Today, a quiet plaque near the
            grandstand stands as a solemn reminder that the soil beneath the hoofbeats carries a
            deeper, more complex history.
          </p>
          <p className="venue__text">
            Racing resumed on May 15, 1945 — the day after V-E Day — and Santa Anita has never
            looked back. In 1984, the world came to watch as the track hosted the Olympic equestrian
            competitions. Today, it remains one of the most storied venues in thoroughbred racing:
            a place where champions are crowned, where history whispers in the grandstand, and where
            every race day is a thread woven into nearly a century of American sport.
          </p>
          <hr className="venue__divider" />
        </div>

        <div className="venue__images">
          <img src={venueImgTop}    alt="Santa Anita Park panorama"  className="venue__img-top" />
          <img src={venueImgBottom} alt="Santa Anita Park entrance"  className="venue__img-bottom" />
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <main>
      <HeroSlider />
      <div className="section-gap" />
      <InnovationSection />
      <div className="section-gap" />
      <VenueSection />
    </main>
  );
}

export default HomePage;
