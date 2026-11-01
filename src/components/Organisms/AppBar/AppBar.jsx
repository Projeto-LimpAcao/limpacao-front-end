import { Link, NavLink } from "react-router-dom";
import { Plus, LogOut, Menu, Moon, Sun } from "lucide-react";

import "./AppBar.css";
import DrawerLateral from "../DrawerLateral/DrawerLateral";
import Logo from "../../moleculas/Logo/Logo";
import Botao from "../../atomos/Botao/Botao";

export default function AppBar({
  menu = [],
  usuario = null,
  estaLogado = false,
  estaEscuro = false,
  drawerAberto = false,
  mostrarBotaoTema = false,
  caminhoHome = "/",
  onAbrirMenu,
  onFecharMenu,
  onAlternarTema,
  onSair,
  onNovoReporte,
}) {
  const menuVisivel = menu;

  return (
    <>
      <header className="appbar">
        <div className="appbar__interno">
          <button
            type="button"
            className="appbar__hamburguer"
            aria-label="Abrir menu"
            onClick={onAbrirMenu}
          >
            <Menu size={22} />
          </button>

          <Link to={caminhoHome} className="appbar__logo">
            <Logo tamanho="medio" />
          </Link>

          <nav className="appbar__abas" aria-label="Navegação principal">
            {menuVisivel.map(({ label, caminho }) => (
              <NavLink
                key={label}
                to={caminho}
                className={({ isActive }) =>
                  `appbar__aba ${isActive ? "appbar__aba--ativa" : ""}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="appbar__acoes">
            {mostrarBotaoTema && (
              <Botao
                variante="fantasma"
                tamanho="pequeno"
                onClick={onAlternarTema}
                icone={estaEscuro ? <Sun size={18} /> : <Moon size={18} />}
                ariaLabel={
                  estaEscuro ? "Mudar para tema claro" : "Mudar para tema escuro"
                }
                title={estaEscuro ? "Tema claro" : "Tema escuro"}
              />
            )}

            {estaLogado && (
              <>
                <span className="appbar__saudacao">
                  Olá, <strong>{usuario?.nome ?? "usuário"}</strong>
                </span>

                <Botao
                  variante="fantasma"
                  tamanho="pequeno"
                  onClick={onSair}
                  icone={<LogOut size={18} />}
                  ariaLabel="Sair da conta"
                  title="Sair"
                />
              </>
            )}

            {onNovoReporte && (
              <Botao onClick={onNovoReporte} icone={<Plus size={18} />}>
                <span className="appbar__texto-reportar">Reportar</span>
              </Botao>
            )}
          </div>
        </div>
      </header>

      <DrawerLateral
        aberto={drawerAberto}
        onFechar={onFecharMenu}
        menu={menuVisivel}
        usuario={usuario}
        estaLogado={estaLogado}
      />
    </>
  );
}
