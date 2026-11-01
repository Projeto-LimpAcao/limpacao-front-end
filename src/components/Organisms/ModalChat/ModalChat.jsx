import { useCallback, useEffect, useRef, useState } from "react";
import { Reply } from "lucide-react";
import "./ModalChat.css";
import Modal from "../../moleculas/Modal/Modal";
import Textarea from "../../atomos/Textarea/Textarea";
import Botao from "../../atomos/Botao/Botao";
import Alerta from "../../moleculas/Alerta/Alerta";
import { formatarDataHora } from "../../../utils/formatar";
import {
  criarClienteChat,
  listarMensagensChat,
  mapearMensagemChat,
} from "../../../services/chatService";

function mesclarMensagens(...listas) {
  const mensagensPorId = new Map();
  listas.flat().forEach((mensagem) => {
    mensagensPorId.set(String(mensagem.id), mensagem);
  });

  const ordenadas = [...mensagensPorId.values()].sort((a, b) => {
    const dataA = new Date(a.data).getTime();
    const dataB = new Date(b.data).getTime();
    return (Number.isNaN(dataA) ? 0 : dataA) - (Number.isNaN(dataB) ? 0 : dataB);
  });

  const porId = new Map(ordenadas.map((mensagem) => [String(mensagem.id), mensagem]));
  return ordenadas.map((mensagem) => {
    if (!mensagem.respostaAId) return mensagem;
    const original = porId.get(String(mensagem.respostaAId));
    if (!original) return mensagem;

    return {
      ...mensagem,
      respostaAAutor: mensagem.respostaAAutor || original.autor,
      respostaATexto: mensagem.respostaATexto || original.texto,
    };
  });
}

export default function ModalChat({
  reporte = null,
  usuario = null,
  onFechar,
  onEnviar,
  onMensagemRecebida,
  onHistoricoCarregado,
}) {
  const [mensagens, setMensagens] = useState(() => reporte?.mensagens ?? []);
  const mensagensRef = useRef(mensagens);
  const [texto, setTexto] = useState("");
  const [mensagemRespondida, setMensagemRespondida] = useState(null);
  const [erro, setErro] = useState("");
  const [estadoConexao, setEstadoConexao] = useState(
    usuario ? "conectando" : "demo",
  );
  const [enviando, setEnviando] = useState(false);
  const [mensagensNovas, setMensagensNovas] = useState(0);
  const clienteRef = useRef(null);
  const respostasPendentesRef = useRef(new Map());
  const listaRef = useRef(null);
  const pertoDoFimRef = useRef(true);
  const autenticado = Boolean(usuario);
  const nomeUsuario = usuario?.nome;
  const reporteId = reporte?.id;

  const atualizarMensagens = useCallback((novasMensagens) => {
    mensagensRef.current = novasMensagens;
    setMensagens(novasMensagens);
    return novasMensagens;
  }, []);

  const adicionarMensagem = useCallback((mensagem) => {
    if (
      mensagensRef.current.some(
        (atual) => String(atual.id) === String(mensagem.id),
      )
    ) {
      return;
    }

    const mensagemDoUsuario = nomeUsuario
      ? mensagem.autor === nomeUsuario
      : mensagem.autor === "Você";
    if (pertoDoFimRef.current || mensagemDoUsuario) {
      pertoDoFimRef.current = true;
      setMensagensNovas(0);
    } else {
      setMensagensNovas((quantidade) => quantidade + 1);
    }

    const novasMensagens = mesclarMensagens(mensagensRef.current, [mensagem]);
    atualizarMensagens(novasMensagens);
  }, [atualizarMensagens, nomeUsuario]);

  const aoRolarMensagens = (evento) => {
    const lista = evento.currentTarget;
    const pertoDoFim =
      lista.scrollHeight - lista.scrollTop - lista.clientHeight < 48;
    pertoDoFimRef.current = pertoDoFim;
    if (pertoDoFim) setMensagensNovas(0);
  };

  const irParaMensagensRecentes = () => {
    const lista = listaRef.current;
    if (!lista) return;

    lista.scrollTo({ top: lista.scrollHeight, behavior: "smooth" });
    pertoDoFimRef.current = true;
    setMensagensNovas(0);
  };

  const responderMensagem = (mensagem) => {
    setMensagemRespondida(mensagem);
    window.requestAnimationFrame(() => {
      const campo = document.getElementById("chat-campo-mensagem");
      campo?.scrollIntoView({ behavior: "smooth", block: "center" });
      campo?.focus({ preventScroll: true });
    });
  };

  useEffect(() => {
    const lista = listaRef.current;
    if (lista && pertoDoFimRef.current) {
      lista.scrollTop = lista.scrollHeight;
    }
  }, [mensagens]);

  useEffect(() => {
    if (reporteId == null) return undefined;

    if (!autenticado) return undefined;

    let ativo = true;
    const carregarHistorico = () => {
      return listarMensagensChat(reporteId)
        .then((historico) => {
          if (!ativo) return;
          const mensagensAtualizadas = atualizarMensagens(
            mesclarMensagens(historico, mensagensRef.current),
          );
          onHistoricoCarregado?.(reporteId, mensagensAtualizadas);
        })
        .catch((problema) => {
          if (ativo) setErro(problema.message);
        });
    };

    const cliente = criarClienteChat({
      onConnect: () => {
        if (!ativo) return;
        setEstadoConexao("conectado");
        setErro("");
        cliente.subscribe(`/topic/chat/${reporteId}`, (frame) => {
          if (!ativo) return;
          try {
            const mensagemRecebida = mapearMensagemChat(JSON.parse(frame.body));
            const chave = mensagemRecebida
              ? `${mensagemRecebida.autor}\u0000${mensagemRecebida.texto}`
              : "";
            const respostasPendentes = respostasPendentesRef.current.get(chave);
            const respostaPendente = respostasPendentes?.shift();
            if (respostasPendentes?.length === 0) {
              respostasPendentesRef.current.delete(chave);
            }
            const mensagem = mensagemRecebida && respostaPendente
              ? {
                  ...mensagemRecebida,
                  respostaAId:
                    mensagemRecebida.respostaAId ?? respostaPendente.id,
                  respostaAAutor:
                    mensagemRecebida.respostaAAutor || respostaPendente.autor,
                  respostaATexto:
                    mensagemRecebida.respostaATexto || respostaPendente.texto,
                }
              : mensagemRecebida;
            if (mensagem) {
              adicionarMensagem(mensagem);
              onMensagemRecebida?.(reporteId, mensagem);
            }
          } catch {
            setErro("O servidor enviou uma mensagem inválida.");
          }
        });
        carregarHistorico();
      },
      onStompError: () => {
        if (ativo) {
          setEstadoConexao("erro");
          setErro("O servidor recusou a conexão do chat. Tente novamente.");
        }
      },
      onWebSocketError: () => {
        if (ativo) {
          setEstadoConexao("erro");
          setErro("Não foi possível conectar ao chat. Verifique se o servidor está disponível.");
        }
      },
      onWebSocketClose: () => {
        if (ativo) {
          setEstadoConexao("reconectando");
          setErro("Conexão perdida. Tentando reconectar ao chat...");
        }
      },
    });

    clienteRef.current = cliente;
    carregarHistorico();
    cliente.activate();

    return () => {
      ativo = false;
      clienteRef.current = null;
      cliente.deactivate().catch(() => {});
    };
  }, [
    autenticado,
    adicionarMensagem,
    atualizarMensagens,
    onHistoricoCarregado,
    onMensagemRecebida,
    reporteId,
    usuario?.nome,
  ]);

  if (!reporte) return null;
  const enviar = async () => {
    const textoMensagem = texto.trim();
    if (!textoMensagem) {
      setErro("Escreva uma mensagem antes de enviar.");
      return;
    }

    setErro("");
    setEnviando(true);
    try {
      if (autenticado) {
        const cliente = clienteRef.current;
        if (!cliente?.connected) {
          throw new Error("O chat ainda não está conectado. Aguarde e tente novamente.");
        }

        const chaveResposta = `${usuario.nome}\u0000${textoMensagem}`;
        let respostasPendentes;
        if (mensagemRespondida) {
          respostasPendentes =
            respostasPendentesRef.current.get(chaveResposta) ?? [];
          respostasPendentes.push(mensagemRespondida);
          respostasPendentesRef.current.set(chaveResposta, respostasPendentes);
        }
        try {
          cliente.publish({
            destination: `/app/chat/${reporte.id}`,
            body: JSON.stringify({
              autor: usuario.nome,
              texto: textoMensagem,
              respostaAId: mensagemRespondida?.id ?? null,
            }),
          });
        } catch (problema) {
          if (mensagemRespondida) {
            respostasPendentes.pop();
            if (respostasPendentes.length === 0) {
              respostasPendentesRef.current.delete(chaveResposta);
            }
          }
          throw problema;
        }
      } else if (onEnviar) {
        await onEnviar(reporte.id, textoMensagem);
        adicionarMensagem({
          id: Date.now(),
          autor: "Você",
          texto: textoMensagem,
          data: new Date().toISOString(),
          respostaAId: mensagemRespondida?.id ?? null,
          respostaAAutor: mensagemRespondida?.autor ?? "",
          respostaATexto: mensagemRespondida?.texto ?? "",
        });
      }
      setTexto("");
      setMensagemRespondida(null);
    } catch (problema) {
      setErro(problema.message || "Não foi possível enviar a mensagem.");
    } finally {
      setEnviando(false);
    }
  };

  const aoPressionarTecla = (evento) => {
    if (
      evento.key !== "Enter" ||
      evento.shiftKey ||
      evento.nativeEvent.isComposing ||
      enviando
    ) {
      return;
    }

    evento.preventDefault();
    void enviar();
  };

  return (
    <Modal
      aberto
      onFechar={onFechar}
      titulo={reporte.titulo}
      largura="760px"
      className="modal--chat"
    >
      {autenticado ? (
        <p className="chat__conexao" role="status" aria-live="polite">
          {estadoConexao === "conectado"
            ? "Chat conectado em tempo real."
            : estadoConexao === "reconectando"
              ? "Reconectando ao chat..."
              : estadoConexao === "erro"
                ? "Chat desconectado."
                : "Conectando ao chat..."}
        </p>
      ) : (
        <p className="chat__conexao">
          Entre na sua conta para conversar em tempo real com a comunidade.
        </p>
      )}
      <div className="chat__lista-container">
        <div
          ref={listaRef}
          className="chat__lista"
          onScroll={aoRolarMensagens}
          aria-live="polite"
        >
          {mensagens.length > 0 ? (
            mensagens.map((mensagem) => (
              <div
                key={mensagem.id}
                id={`chat-mensagem-${mensagem.id}`}
                className={`chat__mensagem ${
                  mensagem.autor === usuario?.nome ||
                  (!autenticado && mensagem.autor === "Você")
                    ? "chat__mensagem--minha"
                    : ""
                }`.trim()}
              >
                {mensagem.respostaAId && (
                  <button
                    type="button"
                    className="chat__citacao"
                    onClick={() => {
                      document
                        .getElementById(`chat-mensagem-${mensagem.respostaAId}`)
                        ?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                    aria-label={`Ver mensagem de ${mensagem.respostaAAutor}`}
                  >
                    <strong>{mensagem.respostaAAutor}</strong>
                    <span>{mensagem.respostaATexto}</span>
                  </button>
                )}
                <div className="chat__mensagem-topo">
                  <strong>{mensagem.autor}</strong>
                  <time dateTime={mensagem.data}>
                    {formatarDataHora(mensagem.data)}
                  </time>
                </div>
                <p>{mensagem.texto}</p>
                <button
                  type="button"
                  className="chat__responder"
                  onClick={() => responderMensagem(mensagem)}
                  aria-label={`Responder à mensagem de ${mensagem.autor}`}
                  title="Responder"
                >
                  <Reply size={16} aria-hidden="true" />
                </button>
              </div>
            ))
          ) : (
            <p className="chat__vazio">
              Nenhuma mensagem ainda. Comece a conversa e chame gente pra ajudar.
            </p>
          )}
        </div>
        {mensagensNovas > 0 && (
          <button
            type="button"
            className="chat__novas-mensagens"
            onClick={irParaMensagensRecentes}
            aria-label={`${mensagensNovas} novas mensagens. Ir para as mais recentes.`}
          >
            {mensagensNovas === 1
              ? "1 nova mensagem"
              : `${mensagensNovas} novas mensagens`}
          </button>
        )}
      </div>

      <Alerta tipo="erro" onFechar={() => setErro("")}>
        {erro}
      </Alerta>

      {mensagemRespondida && (
        <div className="chat__resposta-selecionada">
          <div>
            <span className="chat__resposta-rotulo">
              Respondendo à mensagem de
            </span>
            <strong>{mensagemRespondida.autor}</strong>
            <blockquote>{mensagemRespondida.texto}</blockquote>
          </div>
          <button
            type="button"
            onClick={() => setMensagemRespondida(null)}
            aria-label="Cancelar resposta"
          >
            ×
          </button>
        </div>
      )}

      <div className="chat__compositor">
        <Textarea
          id="chat-campo-mensagem"
          label="Nova mensagem"
          linhas={3}
          placeholder="Escreva sua mensagem..."
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          onKeyDown={aoPressionarTecla}
        />
        <Botao
          variante="primario"
          tamanho="medio"
          desabilitado={enviando}
          onClick={() => void enviar()}
          ariaLabel={enviando ? "Enviando mensagem" : "Enviar mensagem"}
          title="Enviar mensagem"
        >
          Enviar
        </Botao>
      </div>
    </Modal>
  );
}
