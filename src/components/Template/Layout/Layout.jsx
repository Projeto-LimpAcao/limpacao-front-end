import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./AppLayout.css";
import AppBar from "../../Organisms/AppBar/AppBar";
import Footer from "../../Organisms/Footer/Footer";
import Modal from "../../moleculas/Modal/Modal";
import { MENU } from "../../../config/projeto";
import { useAuth } from "../../../hooks";
import { CAMINHOS } from "../../../rotas/caminhos";

export default function AppLayout({ children, onNovoReporte }) {
  const [sobreAberto, setSobreAberto] = useState(false);
  const [drawerAberto, setDrawerAberto] = useState(false);
  const { usuario, estaLogado, sair } = useAuth();
  const navegar = useNavigate();

  const aoSair = () => {
    sair();
    navegar(CAMINHOS.login, { replace: true });
  };

  const aoReportar = () => {
    if (!estaLogado) {
      navegar(CAMINHOS.login, { replace: true });
      return;
    }

    onNovoReporte?.();
  };

  const aoAbrirMenu = () => setDrawerAberto(true);
  const aoFecharMenu = () => setDrawerAberto(false);

  return (
    <div className="app-layout">
      <AppBar
        menu={MENU}
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

      <Modal
        aberto={sobreAberto}
        onFechar={() => setSobreAberto(false)}
        titulo="Quem somos"
        onConfirmar={() => setSobreAberto(false)}
        rotuloConfirmar="Fechar"
        rotuloCancelar="Voltar"
      >
        <p>
          O LimpAção é um projeto dedicado a mapear e reportar áreas poluídas em
          Florianópolis, reunindo informações da própria comunidade para
          promover ações ambientais.
        </p>
        <p>
          O objetivo é facilitar a comunicação entre moradores e responsáveis
          pela limpeza urbana, com dados claros e acessíveis sobre o que
          precisa de atenção na cidade.
        </p>
      </Modal>
    </div>
  );
}
