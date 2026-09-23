import "./Alerta.css";

const ICONES = {
  info: "ℹ️",
  sucesso: "✅",
  erro: "⚠️",
  aviso: "⚡",
};

export default function Alerta({ children, tipo = "info", onFechar }) {
  if (!children) return null;

  return (
    <div className={`alerta alerta--${tipo}`} role="alert">
      <span className="alerta__icone" aria-hidden="true">
        {ICONES[tipo]}
      </span>

      <div className="alerta__texto">{children}</div>

      {onFechar && (
        <button
          type="button"
          className="alerta__fechar"
          onClick={onFechar}
          aria-label="Fechar aviso"
        >
          ×
        </button>
      )}
    </div>
  );
}
