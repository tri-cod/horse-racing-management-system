import { Eye } from 'lucide-react';
import Container from '../ui/Container';
import SectionHeader from '../ui/SectionHeader';
import Card from '../ui/Card';
import '../../assets/css/home/NewsSection.css';

// TODO: replace with useNews() hook when /api/news is integrated
const NEWS = [
  {
    id: 1,
    category: 'News',
    title: 'Royal Derby 2026 Officially Kicks Off In July',
    excerpt: 'The new season promises to bring together the strongest lineup of horses and jockeys ever.',
    date: '06/01/2026',
    views: 1280,
    img: 'https://placehold.co/480x320/0c4a6e/ffffff?text=News+1',
  },
  {
    id: 2,
    category: 'Event',
    title: 'Royal Derby Qualifying Round Draw Ceremony',
    excerpt: 'Top stables will compete from a thrilling group stage onward.',
    date: '05/28/2026',
    views: 940,
    img: 'https://placehold.co/480x320/075985/ffffff?text=News+2',
  },
  {
    id: 3,
    category: 'Interview',
    title: 'Jockey Daniel Hayes On His Journey To The Champions Cup',
    excerpt: "The defending champion opens up about the road ahead this season.",
    date: '05/20/2026',
    views: 1530,
    img: 'https://placehold.co/480x320/0369a1/ffffff?text=News+3',
  },
  {
    id: 4,
    category: 'Behind The Scenes',
    title: 'Inside The Stables Ahead Of Tournament Day',
    excerpt: 'A look at the rigorous fitness and nutrition routines behind every champion horse.',
    date: '05/14/2026',
    views: 760,
    img: 'https://placehold.co/480x320/0284c7/ffffff?text=News+4',
  },
];

export default function NewsSection() {
  return (
    <section className="home-news">
      <Container>
        <SectionHeader
          eyebrow="Updates"
          title="News & Events"
          subtitle="Stay up to date with the latest stories from the Royal Derby season."
          align="center"
        />

        <div className="home-news__grid">
          {NEWS.map((item) => (
            <Card key={item.id} className="home-news__card">
              <div className="home-news__image-wrap">
                <img src={item.img} alt={item.title} className="home-news__image" />
                <span className="home-news__category">{item.category}</span>
              </div>
              <div className="home-news__body">
                <h3 className="home-news__title">{item.title}</h3>
                <p className="home-news__excerpt">{item.excerpt}</p>
                <div className="home-news__meta">
                  <span>{item.date}</span>
                  <span className="home-news__views"><Eye size={14} /> {item.views}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
