import "./Botao.css";

export default function Botao({
  children,
  type = "button",
  onClick,
  desabilitado = false,
  variante = "primario",
  tamanho = "medio",
  larguraTotal = false,
  icone,
  title,
  ariaLabel,
}) {
  return (
    <button
      type={type}
      className={[
        "botao",
        `botao--${variante}`,
        `botao--${tamanho}`,
        larguraTotal ? "botao--largura-total" : "",
        !children ? "botao--so-icone" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      disabled={desabilitado}
      title={title}
      aria-label={ariaLabel}
    >
      {icone}
      {children}
    </button>
  );
}
