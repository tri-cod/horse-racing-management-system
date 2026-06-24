import { Eye } from 'lucide-react';
import Container from '../ui/Container';
import SectionHeader from '../ui/SectionHeader';
import Card from '../ui/Card';
import '../../assets/css/home/NewsSection.css';

import eventImg1 from '../../assets/img/events/5a2f86ac24877300810fe5994e7e2de3.jpg';
import eventImg2 from '../../assets/img/events/fa0e6315489cd530c4fb45579b7442f5.jpg';
import eventImg3 from '../../assets/img/events/155465add4be157cf3a6f73485c0d4ac.jpg';
import eventImg4 from '../../assets/img/events/f85ee7e24a84a66f071927a4dde15e03.jpg';

// TODO: replace with useNews() hook when /api/news is integrated
const NEWS = [
  {
    id: 1,
    title: 'Royal Derby 2026 Officially Kicks Off In July',
    excerpt: 'The new season promises to bring together the strongest lineup of horses and jockeys ever.',
    date: '06/01/2026',
    views: 1280,
    img: eventImg1,
  },
  {
    id: 2,
    title: 'Royal Derby Qualifying Round Draw Ceremony',
    excerpt: 'Top stables will compete from a thrilling group stage onward.',
    date: '05/28/2026',
    views: 940,
    img: eventImg3,
  },
  {
    id: 3,
    title: 'Jockey Daniel Hayes On His Journey To The Champions Cup',
    excerpt: "The defending champion opens up about the road ahead this season.",
    date: '05/20/2026',
    views: 1530,
    img: eventImg2,
  },
  {
    id: 4,
    title: 'Inside The Stables Ahead Of Tournament Day',
    excerpt: 'A look at the rigorous fitness and nutrition routines behind every champion horse.',
    date: '05/14/2026',
    views: 760,
    img: eventImg4,
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
