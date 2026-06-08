/**
 * Avatar dạng vòng tròn hiển thị chữ cái đầu.
 *
 * Backend không trả về URL avatar trong AdminUserItemResponse,
 * nên ta tự sinh từ initial. Màu nền được hash từ tên để cùng 1 user
 * luôn có cùng 1 màu, đỡ nhàm.
 *
 * Khi backend bổ sung field avatar, chỉ cần truyền prop `src`.
 */
const PALETTE = [
  '#1565c0', // ocean blue (chủ đạo)
  '#0d47a1',
  '#00838f', // teal
  '#6a1b9a', // purple
  '#c62828', // red
  '#ef6c00', // orange
  '#2e7d32', // green
  '#4527a0', // indigo
  '#ad1457', // pink
  '#283593', // navy
];

function getColor(seed = '') {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  // Tên VN: lấy chữ cái đầu của FIRST word và LAST word ("Lê Văn A" → "LA")
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function UserAvatar({ name, email, src, size = 36 }) {
  // Style inline cho size linh hoạt; còn lại style trong CSS
  const style = { width: size, height: size, fontSize: size * 0.4 };

  if (src) {
    return <img className="au-avatar" src={src} alt={name || email} style={style} />;
  }

  const seed = name || email || 'user';
  style.backgroundColor = getColor(seed);

  return (
    <span className="au-avatar au-avatar--initials" style={style} aria-hidden="true">
      {getInitials(name || email)}
    </span>
  );
}
