import { useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { ZoomIn } from 'lucide-react';
import Modal from './Modal';
import { getCroppedImageBlob } from '@/utils/cropImage';

interface ImageCropModalProps {
  imageSrc: string;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}

export default function ImageCropModal({ imageSrc, onCancel, onConfirm }: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setSaving(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      onConfirm(blob);
    } finally { setSaving(false); }
  };

  const footer = (
    <div className="flex justify-end gap-2.5">
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className="border border-rim-hi px-4 py-2 text-sm font-semibold text-ink-2 transition-colors hover:bg-surface-overlay disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={saving || !croppedAreaPixels}
        className="bg-navy px-4 py-2 text-sm font-semibold text-on-blue transition-colors hover:bg-navy-hi disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Apply'}
      </button>
    </div>
  );

  return (
    <Modal open onClose={onCancel} title="Adjust Photo" backdrop="navy" size="sm" footer={footer} bodyClassName="p-0">
      <div className="relative h-72 w-full bg-navy-deep">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
        />
      </div>
      <div className="flex items-center gap-3 px-5 py-4">
        <ZoomIn size={15} className="shrink-0 text-ink-4" />
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full accent-gold"
          aria-label="Zoom"
        />
      </div>
    </Modal>
  );
}
