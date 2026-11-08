import { requisicaoApi } from "./api";
import { listarContagensMensagens } from "./chatService";

const URGENCIA_API = {
  baixa: "BAIXA",
  media: "MEDIA",
  medium: "MEDIA",
  alta: "ALTA",
};

const STATUS_TELA = {
  PENDENTE: "pending",
  EM_ANDAMENTO: "in-progress",
  RESOLVIDO: "resolved",
};

const URGENCIA_TELA = {
  BAIXA: "baixa",
  MEDIA: "media",
  ALTA: "alta",
};

const STATUS_API = {
  pending: "PENDENTE",
  "in-progress": "EM_ANDAMENTO",
  resolved: "RESOLVIDO",
};

async function validarResposta(resposta, recurso = "reportes") {
  if (resposta.ok) return;

  if (resposta.status === 401) {
    const erro = new Error("Sua sessão expirou. Entre novamente para continuar.");
    erro.status = resposta.status;
    throw erro;
  }
  if (resposta.status === 403) {
    const erro = new Error(
      "Acesso negado pelo servidor. Saia da conta e entre novamente para renovar a sessão.",
    );
    erro.status = resposta.status;
    throw erro;
  }
  if (resposta.status === 409) {
    const erro = new Error("Você já enviou uma oferta de ajuda para este reporte.");
    erro.status = resposta.status;
    throw erro;
  }
  if (resposta.status === 400) {
    /* Regras de negócio voltam com a explicação em "mensagem". */
    const dados = await resposta.json().catch(() => null);
    if (dados?.mensagem) {
      const erro = new Error(dados.mensagem);
      erro.status = resposta.status;
      throw erro;
    }
  }

  throw new Error(
    `Não foi possível acessar ${recurso} (${resposta.status}).`,
  );
}

/* As imagens chegam do backend como texto JSON: '["data:image/...", ...]'. */
function lerListaImagens(valor) {
  if (typeof valor !== "string" || !valor) return [];
  try {
    const dados = JSON.parse(valor);
    return Array.isArray(dados)
      ? dados.filter((imagem) => typeof imagem === "string" && imagem)
      : [valor];
  } catch {
    return [valor];
  }
}

function mapearReporte(
  reporte,
  souDono = false,
  quantidadeMensagens = 0,
  ofertas = [],
  minhaOferta = null,
) {
  const imagens = Array.isArray(reporte.imagens)
    ? reporte.imagens.filter((imagem) => typeof imagem === "string" && imagem)
    : lerListaImagens(reporte.imagem);
  const imagensConclusao = Array.isArray(reporte.imagensConclusao)
    ? reporte.imagensConclusao
    : lerListaImagens(reporte.imagemConclusao);

  return {
    ...reporte,
    urgencia: URGENCIA_TELA[reporte.urgencia] ?? "media",
    status: STATUS_TELA[reporte.status] ?? "pending",
    data: reporte.criadoEm ?? reporte.data,
    imagem: imagens[0] ?? "",
    imagens,
    imagensConclusao,
    participantes: reporte.participantes ?? 0,
    ajudantes: reporte.ajudantes ?? 0,
    mensagens: [],
    quantidadeMensagens,
    ofertas,
    souDono,
    minhaOfertaId: minhaOferta?.id ?? null,
    minhaParticipacao: {
      ajudando: Boolean(minhaOferta),
      participando: false,
    },
  };
}

function montarPayloadReporte(formulario) {
  return {
    titulo: formulario.titulo,
    localizacao: formulario.localizacao,
    cep: formulario.cep ?? "",
    rua: formulario.rua ?? "",
    cidade: formulario.cidade ?? "",
    estado: formulario.estado ?? "",
    numero: formulario.numero ?? "",
    urgencia: URGENCIA_API[formulario.urgencia] ?? "MEDIA",
    imagem: JSON.stringify(formulario.imagens ?? (formulario.imagem ? [formulario.imagem] : [])),
    descricao: formulario.descricao,
    multirao: Boolean(formulario.multirao),
  };
}

export async function listarReportes(
  incluirMeus = true,
  exigirMeus = incluirMeus,
) {
  const [respostaTodos, contagens] = await Promise.all([
    requisicaoApi("relatorios", { semAutenticacao: true }),
    listarContagensMensagens(true),
  ]);
  await validarResposta(respostaTodos);

  const todos = await respostaTodos.json();
  let meus = [];
  let ofertas = [];
  let minhasOfertas = [];
  if (incluirMeus) {
    const respostaMeus = await requisicaoApi("relatorios/meus");
    if (respostaMeus.ok) {
      meus = await respostaMeus.json();
      minhasOfertas = await listarOfertasAjudaEnviadas();
      if (meus.length > 0) {
        ofertas = await listarOfertasAjudaMeus();
      }
    } else if (exigirMeus || respostaMeus.status !== 401) {
      await validarResposta(respostaMeus);
    }
  }

  const idsMeus = new Set(meus.map((reporte) => reporte.id));

  return todos.map((reporte) =>
    mapearReporte(
      reporte,
      idsMeus.has(reporte.id),
      contagens[reporte.id] ?? 0,
      ofertas
        .filter((oferta) => oferta.relatorioId === reporte.id)
        .map((oferta) => ({ ...oferta, data: oferta.criadoEm })),
      minhasOfertas.find((oferta) => oferta.relatorioId === reporte.id) ?? null,
    ),
  );
}

export async function listarOfertasAjudaMeus() {
  const resposta = await requisicaoApi("ofertas-ajuda/minhas");
  await validarResposta(resposta, "as ofertas de ajuda");
  return resposta.json();
}

export async function criarOfertaAjuda(relatorioId, formulario) {
  const resposta = await requisicaoApi(
    `relatorios/${relatorioId}/ofertas-ajuda`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        telefone: formulario.telefone,
        mensagem: formulario.mensagem ?? "",
      }),
    },
  );
  await validarResposta(resposta, "a oferta de ajuda");
  return resposta.json();
}

export async function listarOfertasAjudaEnviadas() {
  const resposta = await requisicaoApi("ofertas-ajuda/enviadas");
  await validarResposta(resposta, "suas ofertas de ajuda");
  return resposta.json();
}

export async function listarMensagensAjudaNaoLidas() {
  const resposta = await requisicaoApi("ofertas-ajuda/mensagens-nao-lidas");
  await validarResposta(resposta, "as notificações de mensagens");
  return resposta.json();
}

export async function listarMensagensConversaAjuda(ofertaId) {
  const resposta = await requisicaoApi(`ofertas-ajuda/${ofertaId}/mensagens`);
  await validarResposta(resposta, "a conversa de ajuda");
  return resposta.json();
}

export async function enviarMensagemConversaAjuda(ofertaId, texto) {
  const resposta = await requisicaoApi(`ofertas-ajuda/${ofertaId}/mensagens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texto }),
  });
  await validarResposta(resposta, "a mensagem");
  return resposta.json();
}

export async function criarReporte(formulario) {
  const resposta = await requisicaoApi("relatorios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(montarPayloadReporte(formulario)),
  });
  await validarResposta(resposta);
  return mapearReporte(await resposta.json(), true);
}

export async function atualizarReporte(id, formulario) {
  const resposta = await requisicaoApi(`relatorios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(montarPayloadReporte(formulario)),
  });
  await validarResposta(resposta);
  return mapearReporte(await resposta.json(), true);
}

export async function excluirReporte(id) {
  const resposta = await requisicaoApi(`relatorios/${id}`, {
    method: "DELETE",
  });
  await validarResposta(resposta);
}

export async function atualizarStatusReporte(
  id,
  status,
  { imagensConclusao, justificativa } = {},
) {
  const statusApi = STATUS_API[status];
  if (!statusApi) {
    throw new Error("Status de reporte inválido.");
  }

  const corpo = { status: statusApi };
  if (imagensConclusao?.length) {
    corpo.imagemConclusao = JSON.stringify(imagensConclusao);
  }
  if (justificativa) corpo.justificativa = justificativa;

  const resposta = await requisicaoApi(`relatorios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });
  await validarResposta(resposta);
  return mapearReporte(await resposta.json(), true);
}
