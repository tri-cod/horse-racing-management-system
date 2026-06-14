import '../../assets/css/admin/UserAvatar.css';

export default function UserAvatar({ name, avatarUrl, size = 36 }) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  if (avatarUrl) {
    return (
      <img
        className="user-avatar"
        src={avatarUrl}
        alt={name}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div className="user-avatar user-avatar--initials" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initials}
    </div>
  );
}