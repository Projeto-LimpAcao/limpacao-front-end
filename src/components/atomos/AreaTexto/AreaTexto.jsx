import "./AreaTexto.css";

const AreaTexto = ({
  valor,
  placeholder = "Digite aqui",
  cor = "padrao",
  aoAlterar,
  aoBlur,
  largura = "250px",
  altura = "120px",
  linhas = 4,
  desabilitado = false,
}) => {
  const estilos = ["area-texto_root"];

  switch (cor) {
    case "primaria":
      estilos.push("area-texto_primario");
      break;

    case "erro":
      estilos.push("area-texto_erro");
      break;

    default:
      estilos.push("area-texto_padrao");
      break;
  }

  return (
    <textarea
      className={estilos.join(" ")}
      value={valor}
      placeholder={placeholder}
      rows={linhas}
      onChange={aoAlterar}
      onBlur={aoBlur}
      disabled={desabilitado}
      style={{ width: largura, height: altura }}
    />
  );
};

export default AreaTexto;
