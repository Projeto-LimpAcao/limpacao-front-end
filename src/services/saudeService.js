import { ACTUATOR_URL, requisicaoApi } from "./api";

function cabecalhosComToken() {
  const headers = { Accept: "application/json" };
  const token = localStorage.getItem("limpacao-token");
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

const MENSAGEM_SEM_CONEXAO =
  "Não foi possível conectar ao servidor. Verifique se o back-end está rodando.";

export async function buscarSaude() {
  const inicio = performance.now();

  let resposta;
  try {
    resposta = await fetch(`${ACTUATOR_URL}/health`, {
      headers: cabecalhosComToken(),
    });
  } catch (problema) {
    throw new Error(MENSAGEM_SEM_CONEXAO, { cause: problema });
  }

  if (resposta.status === 502 || resposta.status === 504) {
    throw new Error(MENSAGEM_SEM_CONEXAO);
  }

  if (!resposta.ok && resposta.status !== 503) {
    throw new Error(`O servidor respondeu com erro (${resposta.status}).`);
  }

  let dados;
  try {
    dados = await resposta.json();
  } catch (problema) {
    throw new Error(MENSAGEM_SEM_CONEXAO, { cause: problema });
  }
  return {
    dados,
    httpStatus: resposta.status,
    tempoMs: Math.round(performance.now() - inicio),
  };
}

export async function buscarRequisicoes() {
  const resposta = await requisicaoApi("metricas/requisicoes");
  if (!resposta.ok) {
    throw new Error(`Não foi possível ler as requisições (${resposta.status}).`);
  }
  return resposta.json();
}
