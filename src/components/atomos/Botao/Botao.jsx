import "./Botao.css";

const Botao = ({
  cor,
  aoClicar,
  aoAlterar,
  children,
  texto,
  icone,
  largura,
  altura,
  desabilitado = false,
}) => {
  const estilos = ["botao-customizado_root"];

  switch (cor) {
    case "primaria":
      estilos.push("botao-customizado_primario");
      break;
    case "secundaria":
      estilos.push("botao-customizado_secundario");
      break;
    case "erro":
      estilos.push("botao-customizado_erro");
      break;
    default:
      estilos.push("botao-customizado_padrao");
      break;
  }

  return (
    <button
      className={estilos.join(" ")}
      onClick={aoClicar}
      onChange={aoAlterar}
      style={{ width: largura, height: altura }}
      disabled={desabilitado}
    >
      {texto}
      {icone && <span className="botao-customizado_icone">{icone}</span>}
      {children}
    </button>
  );
};

export default Botao;
