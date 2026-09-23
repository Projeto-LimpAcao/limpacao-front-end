import "./Avatar.css";

export default function Avatar({
  nome = "Usuário",
  src = "",
  tamanho = "medio",
  cor = "primario",
}) {
  const iniciais = nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className={`avatar avatar--${tamanho} avatar--${cor}`} title={nome}>
      {src ? (
        <img src={src} alt={nome} className="avatar__imagem" />
      ) : (
        iniciais
      )}
    </div>
  );
}
