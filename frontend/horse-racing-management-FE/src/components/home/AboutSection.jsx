import { Link } from 'react-router-dom';
import Container from '../ui/Container';
import '../../assets/css/home/AboutSection.css';

export default function AboutSection() {
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
            <video
              className="home-about__video"
              src="https://res.cloudinary.com/dxg3w2joa/video/upload/v1782286249/about_jbzsjt.mp4"
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
