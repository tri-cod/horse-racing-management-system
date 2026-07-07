// Decorative jockey silk badge — variant 1-6 maps to design system colors
interface SilkProps {
 variant?: number;
 size?: number;
}

// Colors drawn from the design system palette
const COLORS: [string, string][] = [
 ['#0B2A4A', '#C6A14B'], // navy + brass
 ['#1E6FB8', '#ffffff'], // ocean-blue + white
 ['#A32D2D', '#C6A14B'], // danger + brass
 ['#175d9e', '#ffffff'], // accent-hover + white
 ['#0F6E56', '#C6A14B'], // ok + brass
 ['#6E5417', '#ffffff'], // brass-dark + white
];

export default function Silk({ variant = 1, size = 24 }: SilkProps) {
 const [bg, accent] = COLORS[(variant - 1) % COLORS.length];
 return (
 <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
 <circle cx="12" cy="12" r="11" fill={bg} />
 <path d="M12 2 L22 12 L12 22 L2 12 Z" fill={accent} opacity="0.65" />
 <circle cx="12" cy="12" r="4" fill={accent} />
 </svg>
 );
}
