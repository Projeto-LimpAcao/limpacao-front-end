import "./Grid.css";

export default function Grid({ children, colunas = 3, minimo = "260px" }) {
  return (
    <div
      className="grid"
      style={{
        "--grid-colunas": colunas,
        "--grid-minimo": minimo,
      }}
    >
      {children}
    </div>
  );
}
