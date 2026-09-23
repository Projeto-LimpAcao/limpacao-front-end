import "./Section.css";

export default function Section({ titulo, descricao, id, children }) {
  return (
    <section className="section" id={id}>
      {(titulo || descricao) && (
        <header className="section__cabecalho">
          {titulo && <h2 className="section__titulo">{titulo}</h2>}
          {descricao && <p className="section__descricao">{descricao}</p>}
        </header>
      )}

      {children}
    </section>
  );
}
