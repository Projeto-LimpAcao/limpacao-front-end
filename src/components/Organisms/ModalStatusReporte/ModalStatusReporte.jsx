import { useState } from "react";

import Modal from "../../moleculas/Modal/Modal";
import Alerta from "../../moleculas/Alerta/Alerta";
import CampoImagens from "../../moleculas/CampoImagens/CampoImagens";
import Textarea from "../../atomos/Textarea/Textarea";
import { status as infoStatus, tipoMudancaStatus } from "../../../config/listas";
import { prepararImagens } from "../../utils/formatar";

const TAMANHO_MAXIMO_JUSTIFICATIVA = 500;

export default function ModalStatusReporte({
  reporte,
  novoStatus,
  onFechar,
  onConfirmar,
  enviando = false,
  erroGeral = "",
  onLimparErroGeral,
}) {
  const [imagens, setImagens] = useState([]);
  const [justificativa, setJustificativa] = useState("");
  const [erros, setErros] = useState({});
  const [erroArquivo, setErroArquivo] = useState("");

  const tipo = tipoMudancaStatus(reporte.status, novoStatus);
  const de = infoStatus(reporte.status).label;
  const para = infoStatus(novoStatus).label;

  const selecionarImagem = async (evento) => {
    const arquivos = Array.from(evento.target.files ?? []);
    evento.target.value = "";
    if (arquivos.length === 0) return;

    setErroArquivo("");
    try {
      const resultado = await prepararImagens(arquivos, imagens.length);
      if (resultado.imagens.length > 0) {
        setImagens((atuais) => [...atuais, ...resultado.imagens]);
        setErros((atual) => ({ ...atual, imagens: "" }));
      }
      if (resultado.erros.length > 0) setErroArquivo(resultado.erros.join(" "));
    } catch (problema) {
      setErroArquivo(problema.message);
    }
  };

  const removerImagem = (indice) => {
    setImagens((atuais) => atuais.filter((_, atualIndice) => atualIndice !== indice));
  };

  const confirmar = () => {
    if (tipo === "resolver") {
      if (imagens.length === 0) {
        setErros({ imagens: "Anexe pelo menos uma foto da área limpa." });
        return;
      }
      onConfirmar({ imagensConclusao: imagens });
      return;
    }

    if (tipo === "reabrir") {
      const texto = justificativa.trim();
      if (!texto) {
        setErros({ justificativa: "Informe o motivo para reabrir o reporte." });
        return;
      }
      if (texto.length > TAMANHO_MAXIMO_JUSTIFICATIVA) {
        setErros({
          justificativa: `Use no máximo ${TAMANHO_MAXIMO_JUSTIFICATIVA} caracteres.`,
        });
        return;
      }
      onConfirmar({ justificativa: texto });
      return;
    }

    onConfirmar({});
  };

  const titulos = {
    resolver: "Comprovar limpeza",
    reabrir: "Reabrir reporte",
    confirmar: "Alterar status",
  };

  const rotulos = {
    resolver: "Enviar e resolver",
    reabrir: "Reabrir reporte",
    confirmar: "Confirmar",
  };

  return (
    <Modal
      aberto
      onFechar={enviando ? undefined : onFechar}
      titulo={titulos[tipo]}
      onConfirmar={confirmar}
      rotuloConfirmar={rotulos[tipo]}
      confirmando={enviando}
      largura={tipo === "confirmar" ? "440px" : "560px"}
    >
      <Alerta tipo="erro" onFechar={onLimparErroGeral}>
        {erroGeral}
      </Alerta>

      {tipo === "confirmar" && (
        <p>
          Deseja alterar o status de <strong>{reporte.titulo}</strong> de{" "}
          <strong>{de}</strong> para <strong>{para}</strong>?
        </p>
      )}

      {tipo === "resolver" && (
        <>
          <p>
            Para marcar <strong>{reporte.titulo}</strong> como{" "}
            <strong>{para}</strong>, anexe uma foto que comprove a limpeza do
            local.
          </p>
          <Alerta tipo="erro" onFechar={() => setErroArquivo("")}>
            {erroArquivo}
          </Alerta>
          <CampoImagens
            label="Foto da conclusão"
            obrigatorio
            imagens={imagens}
            onArquivoSelecionado={selecionarImagem}
            onRemoverImagem={removerImagem}
            dica="Adicione pelo menos uma foto do local limpo (JPEG, PNG, GIF ou WebP; até 5 MB cada)."
            erro={erros.imagens}
          />
        </>
      )}

      {tipo === "reabrir" && (
        <>
          <p>
            <strong>{reporte.titulo}</strong> está resolvido. Conte por que ele
            precisa voltar para <strong>{para}</strong>. A foto da conclusão
            será removida.
          </p>
          <Textarea
            label="Justificativa"
            obrigatorio
            linhas={4}
            placeholder="Ex: o lixo voltou a ser descartado no local..."
            value={justificativa}
            onChange={(evento) => {
              setJustificativa(evento.target.value);
              setErros((atual) => ({ ...atual, justificativa: "" }));
            }}
            erro={Boolean(erros.justificativa)}
            mensagemErro={erros.justificativa}
          />
        </>
      )}
    </Modal>
  );
}
