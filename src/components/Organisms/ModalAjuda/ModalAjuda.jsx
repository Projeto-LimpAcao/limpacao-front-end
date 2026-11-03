import { useRef } from "react";
import { LockKeyhole } from "lucide-react";
import Modal from "../../moleculas/Modal/Modal";
import Input from "../../atomos/InputTexto/Inputexto";
import Textarea from "../../atomos/Textarea/Textarea";
import Alerta from "../../moleculas/Alerta/Alerta";
import {
  formatarTelefone,
  removerDigitoAnteriorTelefone,
} from "../../../utils/formatarTelefone";

import "./ModalAjuda.css";

export default function ModalAjuda({
  reporte = null,
  nomeUsuario = "",
  onFechar,
  onEnviar,
  formulario = { telefone: "", mensagem: "" },
  erros = {},
  erroGeral = "",
  enviando = false,
  onAlterarCampo,
  onLimparErroGeral,
}) {
  const telefoneRef = useRef(null);

  if (!reporte) return null;

  const enviar = () => {
    if (onEnviar) {
      onEnviar(reporte.id, formulario);
    }
  };

  const alterarTelefone = (evento) => {
    onAlterarCampo?.("telefone")({
      target: { value: formatarTelefone(evento.target.value) },
    });
  };

  const aoTeclarTelefone = (evento) => {
    if (evento.key !== "Backspace") return;

    const input = evento.currentTarget;
    const edicao = removerDigitoAnteriorTelefone(
      input.value,
      input.selectionStart,
      input.selectionEnd,
    );
    if (!edicao) return;

    evento.preventDefault();
    onAlterarCampo?.("telefone")({
      target: { value: edicao.valor },
    });
    window.requestAnimationFrame(() => {
      telefoneRef.current?.setSelectionRange(edicao.posicao, edicao.posicao);
    });
  };

  return (
    <Modal
      aberto
      onFechar={onFechar}
      titulo={`Quero ajudar: ${reporte.titulo}`}
      onConfirmar={enviar}
      rotuloConfirmar="Enviar oferta"
      confirmando={enviando}
    >
      <Alerta tipo="erro" onFechar={onLimparErroGeral}>
        {erroGeral}
      </Alerta>

      <div className="modal-ajuda__mensagem">
        <p className="modal-ajuda__saudacao">
          Olá, <strong>{nomeUsuario}</strong>!
        </p>
        <p className="modal-ajuda__agradecimento">
          Muito obrigado por querer ajudar.
        </p>
        <div className="modal-ajuda__privacidade">
          <LockKeyhole size={16} aria-hidden="true" />
          <p>Seus dados ficarão visíveis somente para quem criou o reporte.</p>
        </div>
      </div>

      <Input
        label="Telefone"
        type="tel"
        obrigatorio
        placeholder="(48) 99999-9999"
        value={formulario.telefone}
        inputRef={telefoneRef}
        onChange={alterarTelefone}
        onKeyDown={aoTeclarTelefone}
        erro={Boolean(erros.telefone)}
        mensagemErro={erros.telefone}
      />

      <Textarea
        label="Como você pode ajudar"
        linhas={3}
        obrigatorio
        placeholder="Ex: tenho carro pra transportar o material, posso no sábado de manhã..."
        value={formulario.mensagem}
        onChange={onAlterarCampo ? onAlterarCampo("mensagem") : undefined}
        erro={Boolean(erros.mensagem)}
        mensagemErro={erros.mensagem}
      />
    </Modal>
  );
}
