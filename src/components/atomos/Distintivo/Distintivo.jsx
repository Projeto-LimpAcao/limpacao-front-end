import "./Distintivo.css";

const Distintivo = ({ texto, cor, icone, children }) => {
  const estilos = ["distintivo_root"];

  switch (cor) {
    case "primaria":
      estilos.push("distintivo_primario");
      break;
    case "secundaria":
      estilos.push("distintivo_secundario");
      break;
    case "erro":
      estilos.push("distintivo_erro");
      break;
    default:
      estilos.push("distintivo_padrao");
      break;
  }

  return (
    <span className={estilos.join(" ")}>
      {icone && <span className="distintivo_icone">{icone}</span>}
      {texto}
      {children}
    </span>
  );
};

export default Distintivo;
