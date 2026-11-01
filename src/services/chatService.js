import { Client } from "@stomp/stompjs";
import { requisicaoApi } from "./api";

function obterUrlWebSocket() {
  const urlConfigurada = import.meta.env.VITE_WS_URL;
  if (urlConfigurada) {
    return urlConfigurada.replace(/^http:/, "ws:").replace(/^https:/, "wss:");
  }

  const apiUrl = import.meta.env.VITE_API_URL || "/api";
  if (/^https?:\/\//i.test(apiUrl)) {
    const url = new URL(apiUrl);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.pathname = `${url.pathname.replace(/\/api\/?$/, "").replace(/\/+$/, "")}/ws`;
    return url.toString();
  }

  const caminhoBase = apiUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");
  const protocolo = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocolo}//${window.location.host}${caminhoBase}/ws`;
}

export function criarClienteChat(callbacks) {
  return new Client({
    brokerURL: obterUrlWebSocket(),
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: callbacks.onConnect,
    onStompError: callbacks.onStompError,
    onWebSocketError: callbacks.onWebSocketError,
    onWebSocketClose: callbacks.onWebSocketClose,
  });
}

export function mapearMensagemChat(mensagem) {
  if (!mensagem || mensagem.id == null || !mensagem.texto) {
    return null;
  }

  return {
    id: mensagem.id,
    autor: mensagem.autor || "Usuário",
    texto: mensagem.texto,
    data: mensagem.criadoEm || mensagem.data || "",
    respostaAId: mensagem.respostaAId ?? null,
    respostaAAutor: mensagem.respostaAAutor ?? "",
    respostaATexto: mensagem.respostaATexto ?? "",
  };
}

async function validarRespostaChat(resposta) {
  if (resposta.ok) return;

  if (resposta.status === 401) {
    throw new Error("Sua sessão expirou. Entre novamente para continuar.");
  }
  if (resposta.status === 403) {
    throw new Error("Acesso negado ao histórico do chat.");
  }

  throw new Error(`Não foi possível carregar o chat (${resposta.status}).`);
}

export async function listarMensagensChat(relatorioId) {
  const resposta = await requisicaoApi(
    `chat/mensagens/relatorio/${relatorioId}`,
  );
  await validarRespostaChat(resposta);

  const dados = await resposta.json();
  return dados.map(mapearMensagemChat).filter(Boolean);
}

export async function listarContagensMensagens() {
  const resposta = await requisicaoApi("chat/mensagens/contagens");
  await validarRespostaChat(resposta);

  const contagens = await resposta.json();
  return Object.fromEntries(
    contagens.map(({ relatorioId, quantidade }) => [
      relatorioId,
      quantidade,
    ]),
  );
}
