import { useMemo, useState } from 'react';
import { Search, Filter, Users } from 'lucide-react';
import { useJockeys } from '../hooks/useJockeys';
import JockeyCard from '../components/jockey/JockeyCard';
import JockeyDetailModal from '../components/jockey/JockeyDetailModal';
import PageHeader from '../components/rd/PageHeader';
import Seo from '../components/seo/Seo';
import '../assets/css/JockeysPage.css';

const SORT_OPTIONS = [
  { value: 'default',  label: 'Default' },
  { value: 'exp-desc', label: 'Experience: high → low' },
  { value: 'exp-asc',  label: 'Experience: low → high' },
  { value: 'age-asc',  label: 'Age: young → old' },
  { value: 'age-desc', label: 'Age: old → young' },
];

const SORTERS = {
  'exp-desc': (a, b) => b.experienceYear - a.experienceYear,
  'exp-asc':  (a, b) => a.experienceYear - b.experienceYear,
  'age-asc':  (a, b) => a.age - b.age,
  'age-desc': (a, b) => b.age - a.age,
};

export default function JockeysPage() {
  const { jockeys, loading, error, refetch } = useJockeys();
  const [search, setSearch]             = useState('');
  const [sortBy, setSortBy]             = useState('default');
  const [selectedJockey, setSelectedJockey] = useState(null);

  const filteredJockeys = useMemo(() => {
    const kw = search.trim().toLowerCase();
    let result = kw ? jockeys.filter((j) => j.name.toLowerCase().includes(kw)) : jockeys;
    const sorter = SORTERS[sortBy];
    if (sorter) result = [...result].sort(sorter);
    return result;
  }, [jockeys, search, sortBy]);

  const handleClearFilters = () => { setSearch(''); setSortBy('default'); };

  return (
    <div className="jockeys-page">
      <Seo title="Jockeys" description="Discover the talented riders competing across the Royal Derby system." />
      <PageHeader eyebrow="Royal Derby" title="Our Jockeys" subtitle="Discover the talented riders competing across the Royal Derby system" />

      <div className="jockeys-page__container">
        <div className="jockeys__toolbar">
          <div className="jockeys__search">
            <Search size={17} />
            <input type="text" placeholder="Search by jockey name..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="jockeys__sort">
            <Filter size={17} />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <p className="jockeys__count">
            {filteredJockeys.length} / {jockeys.length} jockeys
          </p>
        </div>

        {error && (
          <div className="jockeys__error-banner">
            <span>{error}</span>
            <button type="button" className="jockeys__retry-btn" onClick={refetch}>Try Again</button>
          </div>
        )}

        {loading && !error && (
          <div className="jockeys__grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="jockeys__skeleton-card">
                <div className="jockeys__skeleton jockeys__skeleton-avatar" />
                <div className="jockeys__skeleton jockeys__skeleton-line" style={{ width: '70%' }} />
                <div className="jockeys__skeleton jockeys__skeleton-line" style={{ width: '50%' }} />
              </div>
            ))}
          </div>
        )}

        {!loading && !error && jockeys.length === 0 && (
          <div className="jockeys__empty">
            <Users size={48} />
            <p>No active jockeys at the moment.</p>
          </div>
        )}

        {!loading && !error && jockeys.length > 0 && filteredJockeys.length === 0 && (
          <div className="jockeys__empty">
            <Search size={48} />
            <p>No matching jockeys found.</p>
            <button type="button" className="jockeys__clear-btn" onClick={handleClearFilters}>Clear Filters</button>
          </div>
        )}

        {!loading && !error && filteredJockeys.length > 0 && (
          <div className="jockeys__grid">
            {filteredJockeys.map((jockey) => (
              <JockeyCard key={jockey.id} jockey={jockey} onClick={setSelectedJockey} />
            ))}
          </div>
        )}
      </div>

      <JockeyDetailModal jockey={selectedJockey} onClose={() => setSelectedJockey(null)} />
    </div>
  );
}
