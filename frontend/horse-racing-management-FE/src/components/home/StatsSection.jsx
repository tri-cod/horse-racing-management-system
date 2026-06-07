import Container from '../ui/Container';
import '../../assets/css/home/StatsSection.css';

// TODO: replace with useTournamentStats() hook when /api/stats is integrated
const STATS = [
  { value: '24', label: 'Races Per Season' },
  { value: '$12M', label: 'Total Prize Pool' },
  { value: '180+', label: 'Registered Jockeys' },
  { value: '320+', label: 'Competing Horses' },
];

export default function StatsSection() {
  return (
    <section className="home-stats">
      <Container>
        <div className="home-stats__grid">
          {STATS.map((stat) => (
            <div key={stat.label} className="home-stats__item">
              <p className="home-stats__value">{stat.value}</p>
              <p className="home-stats__label">{stat.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
