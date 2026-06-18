import { useLocation } from 'react-router-dom';

export default function PageTransition({ children }) {
  const { key } = useLocation();
  return (
    <div key={key} className="page-transition">
      {children}
    </div>
  );
}
