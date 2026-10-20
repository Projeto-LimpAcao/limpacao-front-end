import { NavLink } from "react-router-dom";
import { X } from "lucide-react";

import "./DrawerLateral.css";
import Logo from "../../moleculas/Logo/Logo";

export default function DrawerLateral({
  aberto = false,
  onFechar,
  menu = [],
  usuario = null,
  estaLogado = false,
}) {
  return (
    <>
      <div
        className={`drawer-fundo ${aberto ? "drawer-fundo--visivel" : ""}`}
        onClick={onFechar}
      />

      <aside className={`drawer ${aberto ? "drawer--aberto" : ""}`}>
        <div className="drawer__topo">
          <Logo tamanho="pequeno" />

          <button
            type="button"
            className="drawer__fechar"
            onClick={onFechar}
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        {estaLogado && (
          <p className="drawer__usuario">
            Olá, <strong>{usuario?.nome ?? "usuário"}</strong>
          </p>
        )}

        <nav aria-label="Menu lateral">
          <ul className="drawer__lista">
            {menu.map(({ label, icone, caminho }) => (
              <li key={label}>
                <NavLink
                  to={caminho}
                  onClick={onFechar}
                  className={({ isActive }) =>
                    `drawer__link ${isActive ? "drawer__link--ativo" : ""}`
                  }
                >
                  {icone && <span className="drawer__icone">{icone}</span>}
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
