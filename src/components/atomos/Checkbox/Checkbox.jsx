import "./Checkbox.css";

const Checkbox = ({
  marcado = false,
  texto,
  cor = "padrao",
  aoAlterar,
  desabilitado = false,
}) => {
  const estilos = ["checkbox_root"];

  switch (cor) {
    case "primaria":
      estilos.push("checkbox_primario");
      break;

    case "erro":
      estilos.push("checkbox_erro");
      break;

    default:
      estilos.push("checkbox_padrao");
      break;
  }

  return (
    <label className={estilos.join(" ")}>
      <input
        type="checkbox"
        className="checkbox_entrada"
        checked={marcado}
        onChange={aoAlterar}
        disabled={desabilitado}
      />
      {texto && <span className="checkbox_texto">{texto}</span>}
    </label>
  );
};

export default Checkbox;
