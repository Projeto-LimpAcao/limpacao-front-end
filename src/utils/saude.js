export const COMPONENTES_OCULTOS = ["ping", "livenessState", "readinessState"];

export const COMPONENTES = {
  db: {
    titulo: "Banco de dados",
    descricao: "Onde ficam guardados os usuários, os reportes e as mensagens.",
    impacto: {
      up: "Os dados do site estão sendo lidos e salvos normalmente.",
      degraded: "O banco responde, mas com problemas. Algumas telas podem falhar.",
      down: "O site não consegue ler nem salvar dados: login e reportes param de funcionar.",
    },
  },
  diskSpace: {
    titulo: "Espaço em disco",
    descricao: "Espaço no servidor para guardar as fotos enviadas nos reportes.",
    impacto: {
      up: "Há espaço suficiente para novas fotos.",
      degraded: "O espaço está acabando.",
      down: "O disco está cheio: novas fotos podem não ser salvas.",
    },
  },
  brasilApi: {
    titulo: "Busca de endereço por CEP",
    descricao: "Serviço externo (BrasilAPI) que preenche o endereço a partir do CEP.",
    impacto: {
      up: "Ao digitar o CEP, o endereço é preenchido automaticamente.",
      degraded:
        "O preenchimento automático pelo CEP pode falhar; o usuário digita o endereço à mão. O resto do site funciona.",
      down: "O preenchimento automático pelo CEP não funciona. O resto do site funciona.",
    },
  },
  hardware: {
    titulo: "Servidor",
    descricao: "Memória, processadores e tempo no ar da aplicação.",
    impacto: {
      up: "O servidor está com recursos suficientes.",
    },
  },
};

const IMPACTO_PADRAO = {
  up: "Funcionando normalmente.",
  degraded: "Funcionando, mas com problemas.",
  down: "Fora do ar.",
  unknown: "Não foi possível saber o estado.",
};

export function impactoDoComponente(nome, status) {
  const { classe } = infoStatus(status);
  return COMPONENTES[nome]?.impacto?.[classe] ?? IMPACTO_PADRAO[classe];
}

export function resumoGeral(status) {
  if (status === "SEM_RESPOSTA") {
    return {
      titulo: "O servidor não está respondendo",
      texto: "O site provavelmente está fora do ar para os usuários.",
    };
  }
  const mensagens = {
    up: {
      titulo: "Tudo funcionando normalmente",
      texto: "Todos os serviços do LimpAção estão respondendo.",
    },
    degraded: {
      titulo: "Funcionando, mas com algum problema",
      texto: "O site está no ar, mas algum serviço está com falha. Veja abaixo qual.",
    },
    down: {
      titulo: "Sistema com falha",
      texto: "Um serviço essencial parou. Os usuários podem não conseguir usar o site.",
    },
    unknown: {
      titulo: "Estado desconhecido",
      texto: "Não foi possível saber como o sistema está.",
    },
  };
  return mensagens[infoStatus(status).classe];
}

export const TAMANHO_HISTORICO = 40;

export function classificarTempo(ms) {
  if (ms < 200) return "Rápido";
  if (ms < 400) return "Normal";
  return "Lento";
}

export function adicionarAoHistorico(historico, verificacao) {
  return [...historico, verificacao].slice(-TAMANHO_HISTORICO);
}

export function resumirHistorico(historico) {
  const total = historico.length;
  const disponiveis = historico.filter(
    ({ status }) => STATUS[status]?.classe !== "down",
  ).length;
  const tempos = historico
    .map(({ tempoMs }) => tempoMs)
    .filter((tempo) => tempo != null);

  return {
    total,
    disponiveis,
    falhas: total - disponiveis,
    disponibilidade: total === 0 ? null : Math.round((disponiveis / total) * 100),
    tempoMedio:
      tempos.length === 0
        ? null
        : Math.round(tempos.reduce((soma, tempo) => soma + tempo, 0) / tempos.length),
    tempoMaximo: tempos.length === 0 ? null : Math.max(...tempos),
  };
}

const STATUS = {
  UP: { classe: "up", rotulo: "Funcionando" },
  DEGRADED: { classe: "degraded", rotulo: "Com problemas" },
  DOWN: { classe: "down", rotulo: "Fora do ar" },
  OUT_OF_SERVICE: { classe: "down", rotulo: "Fora de serviço" },
  UNKNOWN: { classe: "unknown", rotulo: "Desconhecido" },
  SEM_RESPOSTA: { classe: "down", rotulo: "Sem resposta" },
};

export function infoStatus(status) {
  return STATUS[status] ?? STATUS.UNKNOWN;
}

const ROTULOS = {
  database: "Banco",
  validationQuery: "Consulta de validação",
  total: "Total",
  free: "Livre",
  threshold: "Mínimo exigido",
  path: "Caminho",
  exists: "Existe",
  error: "Erro",
};

const CAMPOS_EM_BYTES = ["total", "free", "threshold"];

export function rotuloDetalhe(chave) {
  if (ROTULOS[chave]) return ROTULOS[chave];
  return chave
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/^./, (letra) => letra.toUpperCase());
}

export function formatarBytes(bytes) {
  const unidades = ["bytes", "KB", "MB", "GB", "TB"];
  let valor = bytes;
  let indice = 0;
  while (valor >= 1024 && indice < unidades.length - 1) {
    valor /= 1024;
    indice += 1;
  }
  if (indice === 0) return `${valor} bytes`;
  return `${valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${unidades[indice]}`;
}

const ERROS_CONHECIDOS = [
  [/connect timed out/i, "O serviço não respondeu a tempo para conectar."],
  [/read timed out|timed out|timeout/i, "O serviço demorou demais para responder."],
  [/unknownhost|name or service not known|nodename/i, "Servidor não encontrado. Verifique a conexão com a internet."],
  [/connection refused|connectexception/i, "Conexão recusada: o serviço parece estar desligado."],
  [/communications link failure|cannotgetjdbcconnection|jdbc|could not open jpa|sql/i, "Não foi possível conectar ao banco de dados."],
  [/access denied|authentication/i, "Acesso negado pelo serviço (usuário ou senha incorretos)."],
  [/no space|disk/i, "Problema de espaço em disco no servidor."],
];

export function traduzirErro(texto) {
  const erro = String(texto ?? "");
  const encontrado = ERROS_CONHECIDOS.find(([padrao]) => padrao.test(erro));
  return encontrado ? encontrado[1] : "O serviço apresentou uma falha inesperada.";
}

export function formatarDetalhe(chave, valor) {
  if (chave.endsWith("(ms)") && typeof valor === "number") {
    return { rotulo: rotuloDetalhe(chave.replace(" (ms)", "")), valor: `${valor} ms` };
  }

  const rotulo = rotuloDetalhe(chave);

  if (CAMPOS_EM_BYTES.includes(chave) && typeof valor === "number") {
    return { rotulo, valor: formatarBytes(valor) };
  }
  if (typeof valor === "boolean") {
    return { rotulo, valor: valor ? "Sim" : "Não" };
  }
  if (Array.isArray(valor)) {
    return { rotulo, valor: valor.length === 0 ? "Nenhum" : String(valor.length) };
  }
  if (typeof valor === "number") {
    return { rotulo, valor: valor.toLocaleString("pt-BR") };
  }
  if (valor !== null && typeof valor === "object") {
    return { rotulo, valor: JSON.stringify(valor) };
  }
  return { rotulo, valor: valor ?? "—" };
}

export function listarComponentes(componentes = {}) {
  const prioridade = { down: 0, degraded: 1, unknown: 2, up: 3 };
  return Object.entries(componentes)
    .filter(([nome]) => !COMPONENTES_OCULTOS.includes(nome))
    .map(([nome, dados]) => ({
      nome,
      status: dados.status ?? "UNKNOWN",
      detalhes: dados.details ?? {},
      titulo: COMPONENTES[nome]?.titulo ?? rotuloDetalhe(nome),
      descricao: COMPONENTES[nome]?.descricao ?? "",
    }))
    .sort(
      (a, b) =>
        prioridade[infoStatus(a.status).classe] - prioridade[infoStatus(b.status).classe] ||
        a.titulo.localeCompare(b.titulo, "pt-BR"),
    );
}

export function contarPorStatus(componentes) {
  return componentes.reduce(
    (total, { status }) => {
      total[infoStatus(status).classe] += 1;
      return total;
    },
    { up: 0, degraded: 0, down: 0, unknown: 0 },
  );
}
