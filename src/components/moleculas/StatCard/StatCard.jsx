import "./StatCard.css";

export default function StatCard({ icone, valor, label, onClick, ativo = false }) {
 
  const Elemento = onClick ? "button" : "div";

  return (
    <Elemento
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`stat-card ${onClick ? "stat-card--clicavel" : ""} ${
        ativo ? "stat-card--ativo" : ""
      }`}
    >
      <span className="stat-card__textos">
        <span className="stat-card__label">{label}</span>
        <strong className="stat-card__valor">{valor}</strong>
      </span>

      {icone && <span className="stat-card__icone">{icone}</span>}
    </Elemento>
  );
}
