import "./Badge.css";

/** Apenas para fins de documentação, não é necessário importar o componente para utilizá-lo.
 * Exemplo:
 *   <Badge cor="perigo" icone={<AlertCircle size={13} />}>Urgente</Badge>
 */
export default function Badge({ children, cor = "neutro", icone }) {
  return (
    <span className={`badge badge--${cor}`}>
      {icone}
      {children}
    </span>
  );
}
