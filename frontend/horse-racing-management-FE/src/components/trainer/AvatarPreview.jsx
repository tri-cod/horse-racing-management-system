import '../../assets/css/trainer/AvatarPreview.css';

export default function AvatarPreview({ url, name }) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'T';

  return (
    <div className="avatar-preview">
      {url ? (
        <img className="avatar-preview__img" src={url} alt={name || 'Trainer'} />
      ) : (
        <div className="avatar-preview__placeholder">{initials}</div>
      )}
    </div>
  );
}
