import "./Carregando.css";

export default function Carregando({ texto = "Carregando...", tamanho = "medio" }) {
  return (
    <div className="carregando" role="status" aria-live="polite">
      <span className={`carregando__roda carregando__roda--${tamanho}`} />
      {texto && <span className="carregando__texto">{texto}</span>}
    </div>
  );
}
