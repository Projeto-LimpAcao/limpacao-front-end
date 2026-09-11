import "./Rotulo.css";

const Rotulo = ({
  texto,
  para,
  cor = "padrao",
  obrigatorio = false,
  children,
}) => {
  const estilos = ["rotulo_root"];

  switch (cor) {
    case "primaria":
      estilos.push("rotulo_primario");
      break;

    case "erro":
      estilos.push("rotulo_erro");
      break;

    default:
      estilos.push("rotulo_padrao");
      break;
  }

  return (
    <label className={estilos.join(" ")} htmlFor={para}>
      {texto}
      {children}
      {obrigatorio && <span className="rotulo_obrigatorio">*</span>}
    </label>
  );
};

export default Rotulo;
