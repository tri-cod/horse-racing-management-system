import { useRef, type ClipboardEvent, type KeyboardEvent, type ChangeEvent } from 'react';

interface OtpBoxesProps {
 value: string;
 onChange: (value: string) => void;
 hasError?: boolean;
}

export default function OtpBoxes({ value, onChange, hasError = false }: OtpBoxesProps) {
 const refs = useRef<(HTMLInputElement | null)[]>([]);
 const chars = Array.from({ length: 6 }, (_, i) => value[i] ?? '');

 const focus = (i: number) => refs.current[i]?.focus();

 const handleChange = (e: ChangeEvent<HTMLInputElement>, i: number) => {
 const digit = e.target.value.replace(/\D/g, '').slice(-1);
 const next = chars.map((c, j) => (j === i ? digit : c));
 onChange(next.join(''));
 if (digit && i < 5) focus(i + 1);
 };

 const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, i: number) => {
 if (e.key === 'Backspace') {
 e.preventDefault();
 if (chars[i]) { onChange(chars.map((c, j) => (j === i ? '' : c)).join('')); }
 else if (i > 0) { onChange(chars.map((c, j) => (j === i - 1 ? '' : c)).join('')); focus(i - 1); }
 } else if (e.key === 'ArrowLeft' && i > 0) { e.preventDefault(); focus(i - 1); }
 else if (e.key === 'ArrowRight' && i < 5) { e.preventDefault(); focus(i + 1); }
 };

 const handlePaste = (e: ClipboardEvent) => {
 e.preventDefault();
 const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
 const next = Array.from({ length: 6 }, (_, i) => digits[i] ?? '');
 onChange(next.join(''));
 focus(Math.min(digits.length, 5));
 };

 return (
 <div className="flex justify-center gap-3">
 {chars.map((char, i) => (
 <input
 key={i}
 ref={(el) => { refs.current[i] = el; }}
 type="text"
 inputMode="numeric"
 value={char}
 onChange={(e) => handleChange(e, i)}
 onKeyDown={(e) => handleKeyDown(e, i)}
 onPaste={handlePaste}
 onFocus={(e) => e.target.select()}
 maxLength={1}
 aria-invalid={hasError}
 className={`tnum h-14 w-12 rounded border-2 bg-surface-input text-center text-xl font-bold text-navy outline-none transition focus:ring-2 ${
 hasError
 ? 'border-fail focus:border-fail focus:ring-fail/10'
 : 'border-rim focus:border-navy focus:ring-navy/10'
 }`}
 />
 ))}
 </div>
 );
}
