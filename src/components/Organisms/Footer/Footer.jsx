import { ArrowRight, Leaf } from "lucide-react";
import { Link } from "react-router-dom";

import "./Footer.css";

export default function Footer({
  descricao = "Uma comunidade mais limpa começa quando alguém percebe, compartilha e decide agir. Junte-se a quem está transformando cuidado em atitude.",
  colunas = [
    {
      titulo: "Projeto",
      links: [{ label: "Como funciona", href: "/trabalhos#como-funciona" }],
    },
    {
      titulo: "Explore",
      links: [
        { label: "Início", href: "/" },
        { label: "Projetos e ações", href: "/trabalhos" },
        { label: "Reportes da comunidade", href: "/reportes" },
      ],
    },
    {
      titulo: "Participe",
      links: [
        { label: "Criar um reporte", href: "/reportes" },
        { label: "Criar uma conta", href: "/login" },
      ],
    },
  ],
  copyright = "© 2026 LimpAção. Todos os direitos reservados.",
  onSobreClick,
}) {
  const colunasSeguras = Array.isArray(colunas) ? colunas : [];

  return (
    <footer className="footer">
      <div className="footer__interno">
        <section
          className="footer__convite"
          aria-labelledby="footer-convite-titulo"
        >
          <div className="footer__convite-conteudo">
            <span className="footer__convite-etiqueta">
              <Leaf size={15} aria-hidden="true" />
              Cuidado coletivo, impacto real
            </span>
            <h2 id="footer-convite-titulo">
              Um lugar melhor começa com a gente.
            </h2>
            <p>
              Encontre uma iniciativa perto de você e dê o próximo passo.
            </p>
          </div>
          <Link className="footer__convite-botao" to="/reportes">
            Explorar reportes
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </section>

        <div className="footer__conteudo">
          <div className="footer__marca-bloco">
            <Link
              to="/"
              className="footer__marca"
              aria-label="LimpAção — início"
            >
              <span className="footer__marca-icone">L</span>
              <span className="footer__marca-nome">
                Limp<span>Ação</span>
              </span>
            </Link>

            <p className="footer__descricao">{descricao}</p>
          </div>

          <div className="footer__colunas">
            {colunasSeguras.map((coluna) => {
              const links = Array.isArray(coluna?.links) ? coluna.links : [];

              return (
                <div
                  key={coluna?.titulo ?? "coluna"}
                  className="footer__coluna"
                >
                  <strong className="footer__coluna-titulo">
                    {coluna?.titulo}
                  </strong>

                  <ul className="footer__lista">
                    {onSobreClick && coluna?.titulo === "Projeto" && (
                      <li>
                        <button
                          type="button"
                          className="footer__link footer__link--botao"
                          onClick={onSobreClick}
                        >
                          Quem somos
                        </button>
                      </li>
                    )}

                    {links.map((link, indice) => (
                      <li
                        key={`${link?.href ?? link?.label ?? "link"}-${indice}`}
                      >
                        {String(link?.href ?? "").startsWith("/") ? (
                          <Link to={link.href} className="footer__link">
                            {link.label}
                          </Link>
                        ) : (
                          <a href={link.href} className="footer__link">
                            {link.label}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        <div className="footer__base">
          <span>{copyright}</span>
          <span className="footer__base-mensagem">
            Feito com <Leaf size={14} aria-hidden="true" /> para cuidar do que é
            de todos.
          </span>
        </div>
      </div>
    </footer>
  );
}
