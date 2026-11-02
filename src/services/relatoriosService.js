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

async function validarResposta(resposta) {
  if (resposta.ok) return;

  if (resposta.status === 401) {
    throw new Error("Sua sessão expirou. Entre novamente para continuar.");
  }
  if (resposta.status === 403) {
    throw new Error(
      "Acesso negado pelo servidor. Saia da conta e entre novamente para renovar a sessão.",
    );
  }

  throw new Error(
    `Não foi possível acessar os reportes (${resposta.status}).`,
  );
}

function mapearReporte(reporte, souDono = false, quantidadeMensagens = 0) {
  let imagens = [];
  if (Array.isArray(reporte.imagens)) {
    imagens = reporte.imagens.filter((imagem) => typeof imagem === "string" && imagem);
  } else if (typeof reporte.imagem === "string" && reporte.imagem) {
    try {
      const dados = JSON.parse(reporte.imagem);
      imagens = Array.isArray(dados)
        ? dados.filter((imagem) => typeof imagem === "string" && imagem)
        : [reporte.imagem];
    } catch {
      imagens = [reporte.imagem];
    }
  }

  return {
    ...reporte,
    urgencia: URGENCIA_TELA[reporte.urgencia] ?? "media",
    status: STATUS_TELA[reporte.status] ?? "pending",
    data: reporte.criadoEm ?? reporte.data,
    imagem: imagens[0] ?? "",
    imagens,
    participantes: reporte.participantes ?? 0,
    ajudantes: reporte.ajudantes ?? 0,
    mensagens: [],
    quantidadeMensagens,
    ofertas: [],
    souDono,
    minhaParticipacao: { ajudando: false, participando: false },
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
  if (incluirMeus) {
    const respostaMeus = await requisicaoApi("relatorios/meus");
    if (respostaMeus.ok) {
      meus = await respostaMeus.json();
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
    ),
  );
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

export async function atualizarStatusReporte(id, status) {
  const statusApi = STATUS_API[status];
  if (!statusApi) {
    throw new Error("Status de reporte inválido.");
  }

  const resposta = await requisicaoApi(`relatorios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: statusApi }),
  });
  await validarResposta(resposta);
  return mapearReporte(await resposta.json(), true);
}
