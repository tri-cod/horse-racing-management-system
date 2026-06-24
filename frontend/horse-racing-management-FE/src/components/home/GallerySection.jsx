import Container from '../ui/Container';
import SectionHeader from '../ui/SectionHeader';
import '../../assets/css/home/GallerySection.css';

import img1 from '../../assets/img/gallery/cfbdc1c64ac9a7aea8e69bb0c5e65a88.jpg';
import img2 from '../../assets/img/gallery/2888389979c55c5f06bfa8364d9627da.jpg';
import img3 from '../../assets/img/gallery/7ad345e1b09205f71050347321bf1ddb.jpg';
import img4 from '../../assets/img/gallery/7890ec7daa0cc1336b7228e55f585efb.jpg';
import img5 from '../../assets/img/gallery/279c254756f9ecf7d8bc72a69cc6564b.jpg';
import img6 from '../../assets/img/gallery/72398dde136ebc67bd08a66603372169.jpg';
import img7 from '../../assets/img/gallery/c493888d1c64be4c7835aff430c33101.jpg';
import img8 from '../../assets/img/gallery/2d5c9bf2b99a8db28164f71fefe4b554.jpg';

const GALLERY = [
  { id: 1, img: img1 },
  { id: 2, img: img2 },
  { id: 3, img: img3 },
  { id: 4, img: img4 },
  { id: 5, img: img5 },
  { id: 6, img: img6 },
  { id: 7, img: img7 },
  { id: 8, img: img8 },
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
            <div key={item.id} className={`home-gallery__item home-gallery__item--${item.id}`}>
              <img src={item.img} alt={`Royal Derby ${item.id}`} loading="lazy" />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
