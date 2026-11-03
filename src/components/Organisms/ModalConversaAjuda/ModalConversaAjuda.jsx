import { useCallback, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

import "./ModalConversaAjuda.css";
import Modal from "../../moleculas/Modal/Modal";
import Textarea from "../../atomos/Textarea/Textarea";
import Alerta from "../../moleculas/Alerta/Alerta";
import { formatarDataHora } from "../../utils/formatar";
import {
  enviarMensagemConversaAjuda,
  listarMensagensConversaAjuda,
} from "../../../services/relatoriosService";

export default function ModalConversaAjuda({
  oferta,
  usuario,
  onFechar,
  onFalhaAcesso,
  mensagensIniciais = [],
}) {
  const [mensagens, setMensagens] = useState(mensagensIniciais);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const listaRef = useRef(null);
  const acessoNegadoRef = useRef(false);

  const atualizarMensagens = useCallback(async (ativo) => {
    if (acessoNegadoRef.current) return;
    try {
      const resultado = await listarMensagensConversaAjuda(oferta.id);
      if (ativo()) {
        setMensagens(resultado);
        setErro("");
      }
    } catch (problema) {
      if (ativo()) {
        if (problema.status === 401 || problema.status === 403) {
          acessoNegadoRef.current = true;
          onFalhaAcesso?.(problema.message);
        } else {
          setErro(problema.message);
        }
      }
    } finally {
      if (ativo()) setCarregando(false);
    }
  }, [oferta.id, onFalhaAcesso]);

  useEffect(() => {
    let montado = true;
    const ativo = () => montado;
    const temporizador = window.setInterval(
      () => void atualizarMensagens(ativo),
      3000,
    );

    return () => {
      montado = false;
      window.clearInterval(temporizador);
    };
  }, [atualizarMensagens]);

  useEffect(() => {
    if (listaRef.current) {
      listaRef.current.scrollTop = listaRef.current.scrollHeight;
    }
  }, [mensagens]);

  const enviar = async () => {
    const mensagem = texto.trim();
    if (!mensagem || enviando || acessoNegadoRef.current) return;

    setEnviando(true);
    setErro("");
    try {
      const criada = await enviarMensagemConversaAjuda(oferta.id, mensagem);
      setMensagens((atuais) =>
        atuais.some((item) => item.id === criada.id)
          ? atuais
          : [...atuais, criada],
      );
      setTexto("");
    } catch (problema) {
      if (problema.status === 401 || problema.status === 403) {
        acessoNegadoRef.current = true;
        onFalhaAcesso?.(problema.message);
      } else {
        setErro(problema.message);
      }
    } finally {
      setEnviando(false);
    }
  };

  const aoPressionarTecla = (evento) => {
    if (
      evento.key === "Enter" &&
      !evento.shiftKey &&
      !evento.nativeEvent.isComposing
    ) {
      evento.preventDefault();
      void enviar();
    }
  };

  if (!oferta) return null;

  return (
    <Modal
      aberto
      onFechar={onFechar}
      titulo={`Conversa com ${oferta.nome}`}
      largura="680px"
      className="modal--conversa-ajuda"
      onConfirmar={enviar}
      rotuloConfirmar={enviando ? "Enviando..." : "Enviar"}
      confirmando={enviando || !texto.trim()}
      iconeConfirmar={<Send size={16} aria-hidden="true" />}
      ariaLabelConfirmar="Enviar mensagem"
    >
      <p className="conversa-ajuda__reporte">{oferta.reporteTitulo}</p>
      {carregando ? (
        <p className="conversa-ajuda__estado">Carregando conversa...</p>
      ) : (
        <div
          className="conversa-ajuda__mensagens"
          ref={listaRef}
          aria-live="polite"
        >
          {mensagens.length === 0 ? (
            <p className="conversa-ajuda__estado">
              Esta conversa é privada entre você e {oferta.nome}.
            </p>
          ) : (
            mensagens.map((mensagem) => (
              <article
                className={`conversa-ajuda__mensagem ${
                  mensagem.minha ? "conversa-ajuda__mensagem--minha" : ""
                }`}
                key={mensagem.id}
              >
                <div className="conversa-ajuda__mensagem-topo">
                  <strong>
                    {mensagem.minha ? "Você" : mensagem.autor || usuario?.nome}
                  </strong>
                  {mensagem.criadoEm && (
                    <time dateTime={mensagem.criadoEm}>
                      {formatarDataHora(mensagem.criadoEm)}
                    </time>
                  )}
                </div>
                <p>{mensagem.texto}</p>
              </article>
            ))
          )}
        </div>
      )}

      <Alerta tipo="erro" onFechar={() => setErro("")}>
        {erro}
      </Alerta>

      <Textarea
        label="Mensagem"
        linhas={3}
        placeholder="Escreva uma mensagem..."
        value={texto}
        onChange={(evento) => setTexto(evento.target.value)}
        onKeyDown={aoPressionarTecla}
        desabilitado={enviando}
      />
      <p className="conversa-ajuda__dica">Pressione Enter para enviar; Shift+Enter para pular linha.</p>
    </Modal>
  );
}
