import "./Selecao.css";

const Selecao = ({
  valor,
  opcoes = [],
  placeholder = "Selecione",
  cor = "padrao",
  aoAlterar,
  aoBlur,
  largura = "250px",
  altura = "50px",
  desabilitado = false,
}) => {
  const estilos = ["selecao_root"];

  switch (cor) {
    case "primaria":
      estilos.push("selecao_primario");
      break;

    case "erro":
      estilos.push("selecao_erro");
      break;

    default:
      estilos.push("selecao_padrao");
      break;
  }

  return (
    <select
      className={estilos.join(" ")}
      value={valor}
      onChange={aoAlterar}
      onBlur={aoBlur}
      disabled={desabilitado}
      style={{ width: largura, height: altura }}
    >
      <option value="" disabled>
        {placeholder}
      </option>

      {opcoes.map((opcao) => (
        <option key={opcao.valor} value={opcao.valor}>
          {opcao.texto}
        </option>
      ))}
    </select>
  );
};

export default Selecao;
