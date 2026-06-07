import { FIELDS } from '../../hooks/useHorseForm';

export default function HorseForm({ form, errors, loading, handleChange, handleBlur }) {
  return (
    <div className="horse-form__grid">
      {FIELDS.map((field) => (
        <div key={field.name} className="horse-form__field">
          <label className="horse-form__label" htmlFor={field.name}>
            {field.label}
          </label>

          {field.type === 'select' ? (
            <select
              id={field.name}
              name={field.name}
              className={`horse-form__input${errors[field.name] ? ' horse-form__input--error' : ''}`}
              value={form[field.name]}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
            >
              {field.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              placeholder={field.placeholder}
              className={`horse-form__input${errors[field.name] ? ' horse-form__input--error' : ''}`}
              value={form[field.name]}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
            />
          )}

          {errors[field.name] && <span className="horse-form__error">{errors[field.name]}</span>}
        </div>
      ))}
    </div>
  );
}
