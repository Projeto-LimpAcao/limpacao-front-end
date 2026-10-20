import { useState } from "react";

import "./AppLayout.css";
import AppBar from "../../Organisms/AppBar/AppBar";
import Footer from "../../Organisms/Footer/Footer";
import Modal from "../../moleculas/Modal/Modal";

export default function AppLayout({ children, onNovoReporte }) {
  const [sobreAberto, setSobreAberto] = useState(false);

  return (
    <div className="app-layout">
      <AppBar onNovoReporte={onNovoReporte} />

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
