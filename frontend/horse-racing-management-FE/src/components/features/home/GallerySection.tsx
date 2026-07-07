import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import Reveal from '@/components/ui/Reveal';
import g1 from '@/assets/img/gallery/279c254756f9ecf7d8bc72a69cc6564b.jpg';
import g2 from '@/assets/img/gallery/2888389979c55c5f06bfa8364d9627da.jpg';
import g3 from '@/assets/img/gallery/2d5c9bf2b99a8db28164f71fefe4b554.jpg';
import g4 from '@/assets/img/gallery/72398dde136ebc67bd08a66603372169.jpg';
import g5 from '@/assets/img/gallery/7890ec7daa0cc1336b7228e55f585efb.jpg';

const GALLERY = [g1, g2, g3, g4, g5].map((img, i) => ({ id: i + 1, img }));

export default function GallerySection() {
 return (
 <section className="py-32 bg-surface-raised">
 <Container>
 <SectionHeader title="Race Day Gallery"
 subtitle="The most striking shots capturing the spirit and beauty of Royal Derby." />
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
 {GALLERY.map((item, i) => (
 <Reveal key={item.id} delay={(i % 4) * 60}
 className={i === 0 ? 'sm:col-span-2 sm:row-span-2' : ''}>
 <div className="group relative h-full overflow-hidden rounded-md border border-rim bg-surface">
 <img src={item.img} alt={`Royal Derby ${item.id}`} loading="lazy"
 className="h-full w-full object-cover transition duration-500 group-hover:scale-105 group-hover:brightness-75" />
 </div>
 </Reveal>
 ))}
 </div>
 </Container>
 </section>
 );
}
