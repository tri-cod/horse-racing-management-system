import { ZoomIn } from 'lucide-react';
import Container from '../ui/Container';
import SectionHeader from '../ui/SectionHeader';
import '../../assets/css/home/GallerySection.css';

// TODO: replace with useGalleryImages() hook when /api/media is integrated
const GALLERY = [
  { id: 1, span: 'large', img: 'https://placehold.co/800x800/0c4a6e/ffffff?text=Royal+Derby+1' },
  { id: 2, span: 'small', img: 'https://placehold.co/400x380/075985/ffffff?text=Royal+Derby+2' },
  { id: 3, span: 'small', img: 'https://placehold.co/400x380/0369a1/ffffff?text=Royal+Derby+3' },
  { id: 4, span: 'small', img: 'https://placehold.co/400x380/0284c7/ffffff?text=Royal+Derby+4' },
  { id: 5, span: 'small', img: 'https://placehold.co/400x380/0ea5e9/ffffff?text=Royal+Derby+5' },
  { id: 6, span: 'small', img: 'https://placehold.co/400x380/0c4a6e/ffffff?text=Royal+Derby+6' },
  { id: 7, span: 'small', img: 'https://placehold.co/400x380/075985/ffffff?text=Royal+Derby+7' },
  { id: 8, span: 'small', img: 'https://placehold.co/400x380/0369a1/ffffff?text=Royal+Derby+8' },
];

export default function GallerySection() {
  return (
    <section className="home-gallery">
      <Container>
        <SectionHeader
          eyebrow="Moments"
          title="Race Day Gallery"
          subtitle="The most striking shots capturing the spirit and beauty of Royal Derby."
          align="center"
        />

        <div className="home-gallery__grid">
          {GALLERY.map((item) => (
            <div key={item.id} className={`home-gallery__item home-gallery__item--${item.span}`}>
              <img src={item.img} alt={`Royal Derby ${item.id}`} />
              <div className="home-gallery__overlay">
                <ZoomIn size={28} />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
