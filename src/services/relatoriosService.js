import { requisicaoApi } from "./api";

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

function mapearReporte(reporte, souDono = false) {
  return {
    ...reporte,
    urgencia: URGENCIA_TELA[reporte.urgencia] ?? "media",
    status: STATUS_TELA[reporte.status] ?? "pending",
    data: reporte.criadoEm ?? reporte.data,
    imagem: reporte.imagem ?? "",
    participantes: reporte.participantes ?? 0,
    ajudantes: reporte.ajudantes ?? 0,
    mensagens: [],
    ofertas: [],
    souDono,
    minhaParticipacao: { ajudando: false, participando: false },
  };
}

export async function listarReportes() {
  const [respostaTodos, respostaMeus] = await Promise.all([
    requisicaoApi("relatorios"),
    requisicaoApi("relatorios/meus"),
  ]);
  await Promise.all([
    validarResposta(respostaTodos),
    validarResposta(respostaMeus),
  ]);

  const [todos, meus] = await Promise.all([
    respostaTodos.json(),
    respostaMeus.json(),
  ]);
  const idsMeus = new Set(meus.map((reporte) => reporte.id));

  return todos.map((reporte) =>
    mapearReporte(reporte, idsMeus.has(reporte.id)),
  );
}

export async function criarReporte(formulario) {
  const resposta = await requisicaoApi("relatorios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      titulo: formulario.titulo,
      localizacao: formulario.localizacao,
      cep: formulario.cep || null,
      rua: formulario.rua || null,
      cidade: formulario.cidade || null,
      estado: formulario.estado || null,
      numero: formulario.numero || null,
      urgencia: URGENCIA_API[formulario.urgencia] ?? "MEDIA",
      imagem: formulario.imagem || null,
      descricao: formulario.descricao,
      multirao: Boolean(formulario.multirao),
    }),
  });
  await validarResposta(resposta);
  return mapearReporte(await resposta.json(), true);
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
