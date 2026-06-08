import '../assets/css/trainer-profile.css';
import TrainerProfileForm from '../components/form/TrainerProfileForm';

export default function TrainerProfilePage() {
  return (
    <div className="tp-page">
      <div className="tp-container">
        <TrainerProfileForm />
      </div>
    </div>
  );
}