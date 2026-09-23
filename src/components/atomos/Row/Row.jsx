import "./Row.css";

export default function Row({
  children,
  justificar = "flex-start",
  alinhar = "center",
  gap = 16,
}) {
  return (
    <div
      className="row"
      style={{ justifyContent: justificar, alignItems: alinhar, gap }}
    >
      {children}
    </div>
  );
}
