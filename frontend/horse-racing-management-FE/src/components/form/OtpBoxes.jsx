import { useRef } from 'react';

export default function OtpBoxes({ value, onChange, hasError }) {
  const refs = useRef([]);
  const chars = Array.from({ length: 6 }, (_, i) => value[i] || '');

  const focus = (i) => refs.current[i]?.focus();

  const handleChange = (e, i) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1);
    const next = chars.map((c, j) => (j === i ? digit : c));
    onChange(next.join(''));
    if (digit && i < 5) focus(i + 1);
  };

  const handleKeyDown = (e, i) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (chars[i]) {
        const next = chars.map((c, j) => (j === i ? '' : c));
        onChange(next.join(''));
      } else if (i > 0) {
        const next = chars.map((c, j) => (j === i - 1 ? '' : c));
        onChange(next.join(''));
        focus(i - 1);
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      e.preventDefault();
      focus(i - 1);
    } else if (e.key === 'ArrowRight' && i < 5) {
      e.preventDefault();
      focus(i + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = Array.from({ length: 6 }, (_, i) => digits[i] || '');
    onChange(next.join(''));
    focus(Math.min(digits.length, 5));
  };

  return (
    <div className="rg-otp">
      {chars.map((char, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          value={char}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`rg-otp__input${hasError ? ' rg-otp__input--error' : ''}`}
        />
      ))}
    </div>
  );
}
