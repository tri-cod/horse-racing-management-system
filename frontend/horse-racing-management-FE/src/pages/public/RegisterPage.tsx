import RegisterForm from '@/components/features/form/RegisterForm';
import Seo from '@/components/seo/Seo';
import AuthSplitLayout from '@/components/layout/AuthSplitLayout';
import type { UserRole } from '@/types';
import type { ComponentType } from 'react';

const EyeIcon: ComponentType = () => (
 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
 <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
 </svg>
);
const StableIcon: ComponentType = () => (
 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
 <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
 </svg>
);
const JockeyIcon: ComponentType = () => (
 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
 <circle cx="12" cy="7" r="3" /><path d="M6 21v-1a6 6 0 0 1 12 0v1" /><path d="M8 10l-2 5M16 10l2 5" />
 </svg>
);
const TrainerIcon: ComponentType = () => (
 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
 <path d="M12 2 4 7v5c0 5 4 9 8 9s8-4 8-9V7l-8-5z" /><path d="M9 9h6M9 13h6" />
 </svg>
);

const ROLES = [
 { id: 'spectator', label: 'SPECTATOR', desc: 'Watch races, follow standings and view live results', Icon: EyeIcon },
 { id: 'horse_owner', label: 'HORSE OWNER', desc: 'Register horses, manage your stable and track performance', Icon: StableIcon },
 { id: 'trainer', label: 'TRAINER', desc: 'Prepare horses and manage training schedules', Icon: TrainerIcon },
 { id: 'jockey', label: 'JOCKEY', desc: 'Compete in races and manage your professional career', Icon: JockeyIcon },
];

const ROLE_CONFIG: Record<string, { apiRole: UserRole; roleLabel: string }> = {
 spectator: { apiRole: 'USER', roleLabel: 'Spectator' },
 horse_owner: { apiRole: 'HORSE_OWNER', roleLabel: 'Horse Owner' },
 trainer: { apiRole: 'TRAINER', roleLabel: 'Trainer' },
 jockey: { apiRole: 'JOCKEY', roleLabel: 'Jockey' },
};

export default function RegisterPage() {
 return (
 <AuthSplitLayout wide>
 <Seo title="Create Account" description="Register a new Royal Derby account." />

 <div className="mb-8">
 <h1 className="font-serif text-4xl font-bold text-ink sm:text-5xl">Join Royal Derby</h1>
 <p className="mt-2 text-base text-ink-3">Create your account and start your racing journey</p>
 </div>

 <RegisterForm roles={ROLES} roleConfig={ROLE_CONFIG} />
 </AuthSplitLayout>
 );
}
