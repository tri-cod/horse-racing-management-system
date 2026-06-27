import { useState } from 'react';
import { ChevronDown, User } from 'lucide-react';
import Container from '../ui/Container';
import Silk from '../shared/Silk';
import '../../assets/css/home/FeaturedSection.css';

const HORSES = [
  { id: 1, name: 'Ocean Thunder',  breed: 'Thoroughbred',  age: 5, trainer: 'James Wilder' },
  { id: 2, name: 'Royal Tempest',  breed: 'Andalusian',    age: 7, trainer: 'Elena Cruz'   },
  { id: 3, name: 'Midnight Comet', breed: 'Arabian',       age: 4, trainer: 'Marcus Bell'  },
  { id: 4, name: 'Silver Mirage',  breed: 'Akhal-Teke',    age: 6, trainer: 'Sophia Reed'  },
  { id: 5, name: 'Storm Chaser',   breed: 'Thoroughbred',  age: 5, trainer: 'Daniel Hayes' },
  { id: 6, name: 'Golden Horizon', breed: 'Quarter Horse', age: 8, trainer: 'Olivia Grant' },
  { id: 7, name: 'Crimson Blaze',  breed: 'Andalusian',    age: 3, trainer: 'James Wilder' },
  { id: 8, name: 'Northern Star',  breed: 'Arabian',       age: 6, trainer: 'Marcus Bell'  },
];

const JOCKEYS = [
  { id: 1, name: 'Marcus Bell',  years: 9,  silk: 1, img: 'https://placehold.co/48x48/0b2a4a/c6a14b?text=MB' },
  { id: 2, name: 'Sophia Reed',  years: 6,  silk: 2, img: 'https://placehold.co/48x48/0b2a4a/c6a14b?text=SR' },
  { id: 3, name: 'Daniel Hayes', years: 12, silk: 3, img: 'https://placehold.co/48x48/0b2a4a/c6a14b?text=DH' },
  { id: 4, name: 'Olivia Grant', years: 5,  silk: 4, img: 'https://placehold.co/48x48/0b2a4a/c6a14b?text=OG' },
  { id: 5, name: 'James Wilder', years: 8,  silk: 5, img: 'https://placehold.co/48x48/0b2a4a/c6a14b?text=JW' },
  { id: 6, name: 'Elena Cruz',   years: 4,  silk: 6, img: 'https://placehold.co/48x48/0b2a4a/c6a14b?text=EC' },
];

const PREVIEW = 6;

export default function FeaturedSection() {
  const [tab, setTab] = useState('horses');
  const [showAll, setShowAll] = useState(false);

  const horses  = showAll ? HORSES  : HORSES.slice(0, PREVIEW);
  const jockeys = showAll ? JOCKEYS : JOCKEYS.slice(0, PREVIEW);

  return (
    <section className="featured">
      <div className="featured__header">
        <Container>
          <p className="featured__season">Royal Derby 2026</p>
          <div className="featured__tabs">
            <button
              className={`featured__tab${tab === 'horses' ? ' featured__tab--active' : ''}`}
              onClick={() => { setTab('horses'); setShowAll(false); }}
            >
              Horses
            </button>
            <button
              className={`featured__tab${tab === 'jockeys' ? ' featured__tab--active' : ''}`}
              onClick={() => { setTab('jockeys'); setShowAll(false); }}
            >
              Jockeys
            </button>
          </div>
        </Container>
      </div>

      <Container>
        {tab === 'horses' ? (
          <table className="featured__table">
            <thead>
              <tr>
                <th className="featured__th featured__th--pos">Pos.</th>
                <th className="featured__th">Horse</th>
                <th className="featured__th featured__th--hide-sm">Breed</th>
                <th className="featured__th featured__th--hide-sm">Age</th>
                <th className="featured__th featured__th--hide-sm">Trainer</th>
              </tr>
            </thead>
            <tbody>
              {horses.map((horse, idx) => (
                <tr key={horse.id} className="featured__row">
                  <td className="featured__td featured__td--pos">{idx + 1}</td>
                  <td className="featured__td">
                    <span className="featured__name">{horse.name}</span>
                  </td>
                  <td className="featured__td featured__td--hide-sm featured__td--muted">{horse.breed}</td>
                  <td className="featured__td featured__td--hide-sm featured__td--muted">{horse.age} yrs</td>
                  <td className="featured__td featured__td--hide-sm featured__td--muted">{horse.trainer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="featured__table">
            <thead>
              <tr>
                <th className="featured__th featured__th--pos">Pos.</th>
                <th className="featured__th">Jockey</th>
                <th className="featured__th featured__th--hide-sm">Experience</th>
              </tr>
            </thead>
            <tbody>
              {jockeys.map((jockey, idx) => (
                <tr key={jockey.id} className="featured__row">
                  <td className="featured__td featured__td--pos">{idx + 1}</td>
                  <td className="featured__td">
                    <div className="featured__entity">
                      <div className="featured__avatar-icon">
                        <User size={22} />
                      </div>
                      <span className="featured__name">{jockey.name}</span>
                    </div>
                  </td>
                  <td className="featured__td featured__td--hide-sm featured__td--muted">{jockey.years} yrs experience</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="featured__footer">
          <button className="featured__show-all" onClick={() => setShowAll((p) => !p)}>
            {showAll ? 'Show less' : 'Show all'} <ChevronDown size={16} className={showAll ? 'featured__chevron--up' : ''} />
          </button>
        </div>
      </Container>
    </section>
  );
}
