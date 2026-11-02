import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./AppLayout.css";
import AppBar from "../../Organisms/AppBar/AppBar";
import Footer from "../../Organisms/Footer/Footer";
import ScrollTop from "../../Organisms/ScrollTop/ScrollTop";
import Modal from "../../moleculas/Modal/Modal";
import { MENU } from "../../../config/projeto";
import { useAuth } from "../../../hooks";
import { CAMINHOS } from "../../../rotas/caminhos";

export default function AppLayout({ children, onNovoReporte }) {
  const [sobreAberto, setSobreAberto] = useState(false);
  const [drawerAberto, setDrawerAberto] = useState(false);
  const { usuario, estaLogado, sair } = useAuth();
  const navegar = useNavigate();
  const menuVisivel = MENU.filter(({ caminho, privado }) => {
    if (privado) return estaLogado;
    if (caminho === CAMINHOS.login) return !estaLogado;
    return true;
  });

  const aoSair = () => {
    navegar(CAMINHOS.reportes, { replace: true });
    sair();
  };

  const aoReportar = () => {
    if (!estaLogado) {
      navegar(CAMINHOS.login, {
        replace: true,
        state: {
          de: CAMINHOS.reportes,
          estadoDestino: { abrirFormularioReporte: true },
        },
      });
      return;
    }

    if (onNovoReporte) {
      onNovoReporte();
      return;
    }

    navegar(CAMINHOS.reportes, {
      state: { abrirFormularioReporte: true },
    });
  };

  const aoAbrirMenu = () => setDrawerAberto(true);
  const aoFecharMenu = () => setDrawerAberto(false);

  return (
    <div className="app-layout">
      <AppBar
        menu={menuVisivel}
        usuario={usuario}
        estaLogado={estaLogado}
        caminhoHome={CAMINHOS.home}
        drawerAberto={drawerAberto}
        onAbrirMenu={aoAbrirMenu}
        onFecharMenu={aoFecharMenu}
        onSair={aoSair}
        onNovoReporte={aoReportar}
      />

      <main className="app-layout__conteudo">{children}</main>

      <Footer onSobreClick={() => setSobreAberto(true)} />
      <ScrollTop />

      <Modal
        aberto={sobreAberto}
        onFechar={() => setSobreAberto(false)}
        titulo="Quem somos"
        onConfirmar={() => setSobreAberto(false)}
        rotuloConfirmar="Fechar"
        rotuloCancelar="Voltar"
      >
        <p>
          O LimpAção é uma plataforma para comunidades identificarem e
          acompanharem problemas ambientais em espaços públicos e áreas
          naturais, reunindo informações locais para promover ações
          colaborativas.
        </p>
        <p>
          O objetivo é conectar moradores, organizações e serviços responsáveis
          pela preservação e limpeza dos espaços, com informações claras sobre
          as necessidades de cada comunidade.
        </p>
      </Modal>
    </div>
  );
}
