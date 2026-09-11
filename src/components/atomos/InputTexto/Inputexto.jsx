import "./InputTexto.css";

const InputTexto = ({
  valor,
  tipo = "text",
  placeholder = "Digite aqui",
  cor = "padrao",
  aoAlterar,
  aoBlur,
  largura = "250px",
  altura = "50px",
  desabilitado = false,
}) => {
  const estilos = ["input-texto_root"];

  switch (cor) {
    case "primaria":
      estilos.push("input-texto_primario");
      break;

    case "erro":
      estilos.push("input-texto_erro");
      break;

    default:
      estilos.push("input-texto_padrao");
      break;
  }

  const inputProps = {
    className: estilos.join(" "),
    type: tipo,
    placeholder,
    onChange: aoAlterar,
    onBlur: aoBlur,
    disabled: desabilitado,
    style: {
      width: largura,
      height: altura,
    },
  };

  if (tipo !== "file") {
    inputProps.value = valor;
  }

  return <input {...inputProps} />;
};

export default InputTexto;