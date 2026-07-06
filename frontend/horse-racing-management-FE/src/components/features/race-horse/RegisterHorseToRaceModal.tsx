import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getMyHorses } from '@/api/horseOwnerApi';
import { getJockeyList } from '@/api/jockeyApi';
import { registerHorseToRace } from '@/api/raceHorseApi';
import type { Horse, Jockey } from '@/types';

interface RegisterHorseToRaceModalProps {
 open: boolean;
 raceId: number;
 onClose: () => void;
 onSuccess?: (msg: string) => void;
}

export default function RegisterHorseToRaceModal({ open, raceId, onClose, onSuccess }: RegisterHorseToRaceModalProps) {
 const [horses, setHorses] = useState<Horse[]>([]);
 const [jockeys, setJockeys] = useState<Jockey[]>([]);
 const [loadingData, setLoadingData] = useState(true);
 const [selectedHorse, setSelectedHorse] = useState<number | null>(null);
 const [selectedJockey, setSelectedJockey] = useState<number | null>(null);
 const [submitting, setSubmitting] = useState(false);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 if (!open) return;
 setLoadingData(true); setSelectedHorse(null); setSelectedJockey(null); setError(null);
 Promise.all([getMyHorses(), getJockeyList()])
 .then(([h, j]) => { setHorses(h ?? []); setJockeys(j ?? []); })
 .catch(() => setError('Failed to load horses or jockeys.'))
 .finally(() => setLoadingData(false));
 }, [open]);

 const handleSubmit = async () => {
 if (!selectedHorse || !selectedJockey) { setError('Please select both a horse and a jockey.'); return; }
 setSubmitting(true); setError(null);
 try {
 await registerHorseToRace({ raceId, horseId: selectedHorse, jockeyId: selectedJockey });
 onSuccess?.('Horse registered successfully!');
 onClose();
 } catch (e: unknown) {
 const err = e as { response?: { data?: { message?: string } } };
 setError(err.response?.data?.message ?? 'Registration failed.');
 } finally { setSubmitting(false); }
 };

 return (
 <Modal open={open} onClose={onClose} title="Register Horse to Race" size="lg">
 {loadingData ? <div className=""><LoadingSpinner /></div> : (
 <div className="">
 <div>
 <h4 className="">Select Horse</h4>
 {horses.length === 0 ? <p className="">You have no registered horses.</p> : (
 <div className="">
 {horses.map((h) => {
 const hasTrainer = !!h.trainerId;
 return (
 <button key={h.id} type="button" disabled={!hasTrainer}
 className=""
 onClick={() => hasTrainer && setSelectedHorse(h.id)}>
 {h.avatarUrl && <img src={h.avatarUrl} alt={h.horseName} className="" />}
 <span className="">{h.horseName}</span>
 {!hasTrainer && <span className="">No trainer</span>}
 </button>
 );
 })}
 </div>
 )}
 </div>

 <div>
 <h4 className="">Select Jockey</h4>
 {jockeys.length === 0 ? <p className="">No jockeys available.</p> : (
 <div className="">
 {jockeys.map((j) => (
 <label key={j.id} className="">
 <input type="radio" name="jockey" value={j.id}
 checked={selectedJockey === j.id}
 onChange={() => setSelectedJockey(j.id)}
 className="" />
 <span className="">{j.name}</span>
 <span className="">{j.experienceYear} yr exp · Age {j.age}</span>
 </label>
 ))}
 </div>
 )}
 </div>

 {error && <p className="">{error}</p>}

 <div className="">
 <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
 <Button variant="primary" onClick={handleSubmit} disabled={submitting || !selectedHorse || !selectedJockey}>
 {submitting ? 'Registering…' : 'Register'}
 </Button>
 </div>
 </div>
 )}
 </Modal>
 );
}
