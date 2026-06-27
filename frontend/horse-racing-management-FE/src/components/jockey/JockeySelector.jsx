import { useJockeys } from '../../hooks/queries/useJockeys';
import '../../assets/css/JockeySelector.css';

export default function JockeySelector({ value, onChange, placeholder, disabled }) {
  const { jockeys, loading, error } = useJockeys();

  const handleChange = (e) => {
    const selected = e.target.value;
    onChange?.(selected ? Number(selected) : null);
  };

  return (
    <div className="jockey-selector">
      <select
        className="jockey-selector__select"
        value={value ?? ''}
        onChange={handleChange}
        disabled={disabled || loading || !!error}
      >
        <option value="">{placeholder || 'Select a jockey'}</option>
        {jockeys.map((jockey) => (
          <option key={jockey.id} value={jockey.id}>
            {jockey.name} ({jockey.experienceYear} yrs exp.)
          </option>
        ))}
      </select>

      {loading && <p className="jockey-selector__hint">Loading...</p>}
      {error && <p className="jockey-selector__hint jockey-selector__hint--error">{error}</p>}
    </div>
  );
}
