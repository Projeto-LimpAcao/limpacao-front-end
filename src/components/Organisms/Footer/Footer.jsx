import { Link } from "react-router-dom";

import "./Footer.css";

export default function Footer({
  descricao = 'LimpAção conecta moradores, voluntários e gestores para transformar pontos críticos em ações reais.',
  colunas = [
    {
      titulo: 'Projeto',
      links: [
        { label: 'Quem somos', href: '#' },
      ],
    },
  ],
  copyright = '© 2026 LimpAção. Todos os direitos reservados.',
  onSobreClick,
}) {
  const colunasSeguras = Array.isArray(colunas) ? colunas : [];

  return (
    <footer className="footer">
      <div className="footer__conteudo">
        <div className="footer__marca-bloco">
          <span className="footer__marca">
            <span className="footer__marca-icone">L</span>
            LimpAção
          </span>

          <p className="footer__descricao">{descricao}</p>
        </div>

        <div className="footer__colunas">
          {colunasSeguras.map((coluna) => {
            const links = Array.isArray(coluna?.links) ? coluna.links : [];

            return (
              <div key={coluna?.titulo ?? 'coluna'} className="footer__coluna">
                <strong className="footer__coluna-titulo">{coluna?.titulo}</strong>

                <ul className="footer__lista">
                  {onSobreClick && coluna?.titulo === 'Projeto' && (
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

                  {links.map((link) => (
                    <li key={link?.label ?? link?.href ?? Math.random()}>
                      {String(link?.href ?? '').startsWith('/') ? (
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

      <div className="footer__base">{copyright}</div>
    </footer>
  );
}
