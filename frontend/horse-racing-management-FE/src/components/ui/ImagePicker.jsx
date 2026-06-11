import { useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import '../../assets/css/ui/ImagePicker.css';

export default function ImagePicker({
  value = '',
  onChange,
  label = '',
  hint = 'JPG, PNG, WebP. Max 5MB.',
  maxSizeMB = 5,
  width = 160,
  height = 160,
  aspectRatio,
  radius = 'md',
}) {
  const inputRef = useRef(null);
  const [localError, setLocalError] = useState('');

  const handleClick = () => inputRef.current?.click();

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalError('');
    if (!file.type.startsWith('image/')) {
      setLocalError('File must be an image.');
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setLocalError(`File size must be under ${maxSizeMB}MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setLocalError('');
    onChange('');
  };

  const radiusClass =
    {
      sm: 'image-picker__zone--radius-sm',
      md: 'image-picker__zone--radius-md',
      lg: 'image-picker__zone--radius-lg',
      full: 'image-picker__zone--radius-full',
    }[radius] || 'image-picker__zone--radius-md';

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    ...(aspectRatio ? { aspectRatio } : {}),
  };

  return (
    <div className="image-picker">
      {label && <span className="image-picker__label">{label}</span>}
      <div
        className={`image-picker__zone ${radiusClass}${value ? ' image-picker__zone--filled' : ''}`}
        style={style}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        aria-label={label || 'Pick image'}
      >
        {value ? (
          <>
            <img src={value} alt="Preview" className="image-picker__preview" />
            <button
              type="button"
              className="image-picker__remove"
              onClick={handleRemove}
              aria-label="Remove image"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <div className="image-picker__placeholder">
            <ImagePlus size={24} />
            <span>Click to upload</span>
          </div>
        )}
      </div>
      {hint && <span className="image-picker__hint">{hint}</span>}
      {localError && <span className="image-picker__error">{localError}</span>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="image-picker__input"
        onChange={handleFile}
      />
    </div>
  );
}