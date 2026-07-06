interface UserAvatarProps {
 name?: string;
 avatarUrl?: string;
 size?: number;
}

export default function UserAvatar({ name, avatarUrl, size = 36 }: UserAvatarProps) {
 const initials = name
 ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
 : '?';

 const style = { width: size, height: size, fontSize: size * 0.38 };

 if (avatarUrl) {
 return (
 <img
 className="rounded-full object-cover"
 src={avatarUrl}
 alt={name}
 style={style}
 />
 );
 }

 return (
 <div
 className="flex shrink-0 items-center justify-center rounded-full bg-gold text-on-gold font-semibold"
 style={style}
 >
 {initials}
 </div>
 );
}
