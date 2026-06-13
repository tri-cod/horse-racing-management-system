import Container from '../ui/Container';
import SectionHeader from '../ui/SectionHeader';
import '../../assets/css/home/HorsesSection.css';

// TODO: replace with useFeaturedHorses() hook when a public /api/horses endpoint is available
const HORSES = [
  { id: 1, name: 'Ocean Thunder', breed: 'Thoroughbred', img: 'https://placehold.co/360x360/0c4a6e/ffffff?text=Ocean+Thunder' },
  { id: 2, name: 'Royal Tempest', breed: 'Andalusian', img: 'https://placehold.co/360x360/075985/ffffff?text=Royal+Tempest' },
  { id: 3, name: 'Midnight Comet', breed: 'Arabian', img: 'https://placehold.co/360x360/0369a1/ffffff?text=Midnight+Comet' },
  { id: 4, name: 'Silver Mirage', breed: 'Akhal-Teke', img: 'https://placehold.co/360x360/0284c7/ffffff?text=Silver+Mirage' },
  { id: 5, name: 'Storm Chaser', breed: 'Thoroughbred', img: 'https://placehold.co/360x360/0c4a6e/ffffff?text=Storm+Chaser' },
  { id: 6, name: 'Golden Horizon', breed: 'Quarter Horse', img: 'https://placehold.co/360x360/075985/ffffff?text=Golden+Horizon' },
  { id: 7, name: 'Crimson Blaze', breed: 'Andalusian', img: 'https://placehold.co/360x360/0369a1/ffffff?text=Crimson+Blaze' },
  { id: 8, name: 'Northern Star', breed: 'Arabian', img: 'https://placehold.co/360x360/0284c7/ffffff?text=Northern+Star' },
];

export default function HorsesSection() {
  return (
    <section className="home-horses">
      <Container>
        <SectionHeader
          eyebrow="Collection"
          title="Featured Champions"
          subtitle="Meet the most beloved horses at Royal Derby — icons of speed and class."
          align="center"
        />

        <div className="home-horses__grid">
          {HORSES.map((horse) => (
            <div key={horse.id} className="home-horses__item">
              <div className="home-horses__avatar">
                <img src={horse.img} alt={horse.name} />
              </div>
              <h3 className="home-horses__name">{horse.name}</h3>
              <p className="home-horses__breed">{horse.breed}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
