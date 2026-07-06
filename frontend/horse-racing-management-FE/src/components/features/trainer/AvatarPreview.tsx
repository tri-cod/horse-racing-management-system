interface AvatarPreviewProps { url?: string; name?: string }

export default function AvatarPreview({ url, name }: AvatarPreviewProps) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'T';
  return (
    <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full ring-4 ring-gold/30">
      {url ? (
        <img src={url} alt={name ?? 'Trainer'} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gold text-3xl font-bold text-on-gold">
          {initials}
        </div>
      )}
    </div>
  );
}
