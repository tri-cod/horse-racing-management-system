import Container from '../ui/Container';
import SectionHeader from '../ui/SectionHeader';
import '../../assets/css/home/JockeysSection.css';

// TODO: replace with useJockeys() hook when /api/jockeys public listing is integrated
const JOCKEYS = [
  { id: 1, name: 'Marcus Bell', years: 9, img: 'https://placehold.co/320x320/0c4a6e/ffffff?text=Marcus+Bell' },
  { id: 2, name: 'Sophia Reed', years: 6, img: 'https://placehold.co/320x320/075985/ffffff?text=Sophia+Reed' },
  { id: 3, name: 'Daniel Hayes', years: 12, img: 'https://placehold.co/320x320/0369a1/ffffff?text=Daniel+Hayes' },
  { id: 4, name: 'Olivia Grant', years: 5, img: 'https://placehold.co/320x320/0284c7/ffffff?text=Olivia+Grant' },
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
              <div className="home-jockeys__avatar">
                <img src={jockey.img} alt={jockey.name} />
              </div>
              <h3 className="home-jockeys__name">{jockey.name}</h3>
              <p className="home-jockeys__years">{jockey.years} years of experience</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
