import { Link, NavLink, useNavigate } from "react-router-dom";
import { Plus, LogIn, LogOut, Menu, MessageCircle, Moon, Sun } from "lucide-react";

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
  caminhoLogin = "/login",
  onAbrirMenu,
  onFecharMenu,
  onAlternarTema,
  onSair,
  onNovoReporte,
  mensagensNaoLidas = 0,
  onAbrirMensagens,
}) {
  const navegar = useNavigate();
  const menuVisivel = menu;
  const abas = menu.filter(({ caminho }) => caminho !== caminhoLogin);

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
            {abas.map(({ label, caminho }) => (
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
                <button
                  type="button"
                  className="appbar__mensagens"
                  onClick={onAbrirMensagens}
                  aria-label={
                    mensagensNaoLidas > 0
                      ? `Mensagens: ${mensagensNaoLidas} não lida(s)`
                      : "Mensagens"
                  }
                  title="Mensagens"
                >
                  <MessageCircle size={20} />
                  {mensagensNaoLidas > 0 && (
                    <span className="appbar__mensagens-total" aria-hidden="true">
                      {mensagensNaoLidas > 99 ? "99+" : mensagensNaoLidas}
                    </span>
                  )}
                </button>

                <span className="appbar__saudacao">
                  Olá, <strong>{usuario?.nome ?? "usuário"}</strong>
                </span>

                <Botao
                  variante="secundario"
                  tamanho="pequeno"
                  onClick={onSair}
                  icone={<LogOut size={16} />}
                  ariaLabel="Sair da conta"
                  title="Sair da conta"
                >
                  Sair
                </Botao>
              </>
            )}

            {!estaLogado && (
              <Botao
                variante="secundario"
                onClick={() => navegar(caminhoLogin)}
                icone={<LogIn size={18} />}
                ariaLabel="Entrar na conta"
              >
                <span className="appbar__texto-login">Login</span>
              </Botao>
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
