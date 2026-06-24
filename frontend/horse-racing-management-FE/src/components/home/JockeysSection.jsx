import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Container from '../ui/Container';
import SectionHeader from '../ui/SectionHeader';
import Silk from '../rd/Silk';
import '../../assets/css/home/JockeysSection.css';

const JOCKEYS = [
  { id: 1, name: 'Marcus Bell',   years: 9,  img: 'https://placehold.co/320x320/0c4a6e/ffffff?text=MB', silk: 1 },
  { id: 2, name: 'Sophia Reed',   years: 6,  img: 'https://placehold.co/320x320/075985/ffffff?text=SR', silk: 2 },
  { id: 3, name: 'Daniel Hayes',  years: 12, img: 'https://placehold.co/320x320/0369a1/ffffff?text=DH', silk: 3 },
  { id: 4, name: 'Olivia Grant',  years: 5,  img: 'https://placehold.co/320x320/0284c7/ffffff?text=OG', silk: 4 },
];

export default function JockeysSection() {
  return (
    <section className="home-jockeys">
      <Container>
        <SectionHeader
          eyebrow="Our Riders"
          title="Top Jockeys"
          subtitle="Seasoned riders who have left their mark across many Royal Derby seasons."
          align="center"
        />

        <div className="home-jockeys__grid">
          {JOCKEYS.map((jockey) => (
            <div key={jockey.id} className="home-jockeys__item">
              <div className="home-jockeys__avatar-wrap">
                <div className="home-jockeys__avatar">
                  <img
                    src={jockey.img}
                    alt={jockey.name}
                    width={140}
                    height={140}
                    loading="lazy"
                  />
                </div>
                <div className="home-jockeys__silk-badge">
                  <Silk variant={jockey.silk} size={30} />
                </div>
              </div>
              <h3 className="home-jockeys__name">{jockey.name}</h3>
              <p className="home-jockeys__years tnum">{jockey.years} yrs experience</p>
            </div>
          ))}
        </div>

        <div className="home-jockeys__footer">
          <Link to="/jockeys" className="home-jockeys__view-all">
            All Jockeys <ArrowRight size={14} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
