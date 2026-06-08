import { useRef, useState } from 'react';

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

const MAX_SIZE_MB = 2;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

export default function AvatarUpload({ value, onChange, error }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState('');

  const validate = (file) => {
    if (!ACCEPTED.includes(file.type))
      return 'Only JPG, PNG or WebP images are allowed';
    if (file.size > MAX_SIZE_MB * 1024 * 1024)
      return `File size must be under ${MAX_SIZE_MB}MB`;
    return '';
  };

  const processFile = (file) => {
    const err = validate(file);
    if (err) { setLocalError(err); return; }
    setLocalError('');
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange('');
    setLocalError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const showError = error || localError;

  return (
    <div className="av-upload">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="av-upload__input"
      />

      {value ? (
        <div className="av-upload__preview-wrap">
          <div
            className="av-upload__preview"
            onClick={() => inputRef.current?.click()}
          >
            <img src={value} alt="Avatar preview" />
            <div className="av-upload__overlay">
              <CameraIcon />
              <span>Change</span>
            </div>
          </div>
          <button
            type="button"
            className="av-upload__remove"
            onClick={handleRemove}
            aria-label="Remove avatar"
          >
            <TrashIcon />
          </button>
        </div>
      ) : (
        <div
          className={`av-upload__drop${dragOver ? ' av-upload__drop--over' : ''}${showError ? ' av-upload__drop--error' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
        >
          <div className="av-upload__icon">
            <UploadIcon />
          </div>
          <p className="av-upload__title">Upload Avatar</p>
          <p className="av-upload__sub">
            Drag & drop or <span className="av-upload__browse">browse</span>
          </p>
          <p className="av-upload__hint">JPG, PNG or WebP · Max {MAX_SIZE_MB}MB</p>
        </div>
      )}

      {showError && <span className="av-upload__error">{showError}</span>}
    </div>
  );
}