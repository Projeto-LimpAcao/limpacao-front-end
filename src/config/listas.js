export const URGENCIAS = [
  { valor: "baixa", label: "Baixa" },
  { valor: "media", label: "Média" },
  { valor: "alta", label: "Alta" },
];

export const STATUS = [
  { valor: "pending", label: "Pendente" },
  { valor: "in-progress", label: "Em andamento" },
  { valor: "resolved", label: "Resolvido" },
];

export const FILTRO_URGENCIA = [
  { valor: "todas", label: "Todas" },
  ...URGENCIAS,
];

export const FILTRO_STATUS = [
  { valor: "todos", label: "Todos" },
  ...STATUS,
];

export const ORDENACOES = [
  { valor: "recente", label: "Mais recentes" },
  { valor: "antigo", label: "Mais antigos" },
  { valor: "urgencia", label: "Urgência" },
];

export function urgencia(valor = "media") {
  const mapa = {
    baixa: { label: "Baixa", cor: "sucesso" },
    media: { label: "Média", cor: "primario" },
    alta: { label: "Alta", cor: "perigo" },
  };

  return mapa[valor] ?? { label: "Média", cor: "primario" };
}

export function status(valor = "pending") {
  const mapa = {
    pending: { label: "Pendente", cor: "atencao" },
    "in-progress": { label: "Em andamento", cor: "primario" },
    resolved: { label: "Resolvido", cor: "sucesso" },
  };

  return mapa[valor] ?? { label: "Pendente", cor: "atencao" };
}
