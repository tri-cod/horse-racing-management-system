import "../styles/StatCard.css";

function StatCard({ title, value, color = "" }) {
  return (
    <div className={`stat-card ${color}`}>
      <h4>{title}</h4>
      <div className="stat-value">{value ?? 0}</div>
    </div>
  );
}

export default StatCard;
