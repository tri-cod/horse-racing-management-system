import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import Container from '../ui/Container';
import SectionHeader from '../ui/SectionHeader';
import Card from '../ui/Card';

import raceImg1 from '../../assets/img/ee63a717-b5ff-41b1-ad51-860da474eb55.jpg';
import raceImg2 from '../../assets/img/174b40b7b0643c6cdafe82f318879afd.webp';
import raceImg3 from '../../assets/img/venue-santaanita.webp';
import '../../assets/css/home/RacesSection.css';

// TODO: replace with useRaces() hook when /api/races is integrated
const RACES = [
  {
    id: 1,
    name: 'Royal Derby Championship',
    img: raceImg1,
    desc: 'The championship final — where the season\'s finest horses come together to compete for the cup.',
    date: '07/12/2026',
    location: 'Thu Duc Racecourse, Ho Chi Minh City',
  },
  {
    id: 2,
    name: 'Ocean Cup Sprint',
    img: raceImg2,
    desc: 'A short-distance speed race where every second decides the crown.',
    date: '07/26/2026',
    location: 'Dai Nam Racecourse, Binh Duong',
    },
  {
    id: 3,
    name: 'Coastal Classic Stakes',
    img: raceImg3,
    desc: 'A traditional coastal race bringing together renowned regional stables.',
    date: '08/09/2026',
    location: 'Phan Thiet Racecourse',
  },
];

export default function RacesSection() {
  return (
    <section className="home-races">
      <Container>
        <SectionHeader
          eyebrow="Schedule"
          title="Upcoming Races"
          subtitle="Don't miss the next thrilling showdowns of the Royal Derby 2026 season."
          align="center"
        />

        <div className="home-races__grid">
          {RACES.map((race) => (
            <Card key={race.id} className="home-races__card">
              <div className="home-races__image-wrap">
                <img src={race.img} alt={race.name} className="home-races__image" />
              </div>
              <div className="home-races__body">
                <h3 className="home-races__name">{race.name}</h3>
                <p className="home-races__desc">{race.desc}</p>
                <div className="home-races__meta">
                  <span><Calendar size={15} /> {race.date}</span>
                  <span><MapPin size={15} /> {race.location}</span>
                </div>
                <Link to="/races" className="home-races__cta">Details →</Link>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
