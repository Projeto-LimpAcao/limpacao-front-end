import "./Stack.css";

export default function Stack({ children, gap = 16, alinhar = "stretch" }) {
  return (
    <div className="stack" style={{ gap, alignItems: alinhar }}>
      {children}
    </div>
  );
}
