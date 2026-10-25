import { useMemo, useState } from "react";

const RELATORIOS_INICIAIS = [
  {
    id: 1,
    titulo: "Lixo acumulado em praça central",
    localizacao: "Praia da Armação",
    descricao: "Pilha de sacos de lixo e embalagens no entorno da praça, dificultando a passagem dos pedestres.",
    urgencia: "alta",
    status: "in-progress",
    autor: "Maria L.",
    data: "2026-08-16T09:00:00",
    imagem: "",
    multirao: true,
    participantes: 12,
    ajudantes: 8,
    mensagens: [
      { id: 1, autor: "Maria L.", texto: "Preciso de ajuda para limpar o local até sexta.", data: "2026-08-16T09:25:00" },
      { id: 2, autor: "João", texto: "Posso levar uma lona e alguns sacos.", data: "2026-08-16T10:10:00" },
    ],
    ofertas: [],
    souDono: false,
    minhaParticipacao: { ajudando: true, participando: false },
  },
  {
    id: 2,
    titulo: "Entulho em beco do bairro",
    localizacao: "Centro",
    descricao: "Materiais de construção e resíduos de demolição foram jogados em um beco próximo da rua principal.",
    urgencia: "media",
    status: "pending",
    autor: "Pedro S.",
    data: "2026-08-18T14:15:00",
    imagem: "",
    multirao: false,
    participantes: 0,
    ajudantes: 3,
    mensagens: [{ id: 1, autor: "Pedro S.", texto: "Quem pode me ajudar a sinalizar a área?", data: "2026-08-18T14:20:00" }],
    ofertas: [],
    souDono: true,
    minhaParticipacao: { ajudando: false, participando: false },
  },
  {
    id: 3,
    titulo: "Resíduos na praia e faixa de areia",
    localizacao: "Ponta das Canas",
    descricao: "A areia está com plástico e vidro espalhado depois do fim de semana. O cuidado é urgente.",
    urgencia: "alta",
    status: "resolved",
    autor: "Lucas P.",
    data: "2026-08-12T08:00:00",
    imagem: "",
    multirao: true,
    participantes: 20,
    ajudantes: 14,
    mensagens: [{ id: 1, autor: "Lucas P.", texto: "A limpeza foi concluída com apoio da comunidade.", data: "2026-08-13T15:40:00" }],
    ofertas: [],
    souDono: false,
    minhaParticipacao: { ajudando: false, participando: true },
  },
];

export function useRelatorios() {
  const [relatorios, setRelatorios] = useState(RELATORIOS_INICIAIS);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const meusRelatorios = useMemo(
    () => relatorios.filter((reporte) => reporte.souDono),
    [relatorios],
  );

  const estatisticas = useMemo(() => {
    const total = relatorios.length;
    const resolvidos = relatorios.filter((reporte) => reporte.status === "resolved").length;
    const emAndamento = relatorios.filter((reporte) => reporte.status === "in-progress").length;
    const meus = meusRelatorios.length;
    const taxaResolucao = total === 0 ? 0 : Math.round((resolvidos / total) * 100);

    return { total, resolvidos, emAndamento, meus, taxaResolucao };
  }, [meusRelatorios, relatorios]);

  const criar = async (formulario) => {
    const novo = {
      id: Date.now(),
      titulo: formulario.titulo,
      localizacao: formulario.localizacao,
      descricao: formulario.descricao,
      urgencia: formulario.urgencia || "media",
      status: "pending",
      autor: "Você",
      data: new Date().toISOString(),
      imagem: formulario.imagem || "",
      multirao: Boolean(formulario.multirao),
      participantes: 0,
      ajudantes: 0,
      mensagens: [],
      ofertas: [],
      souDono: true,
      minhaParticipacao: { ajudando: false, participando: false },
    };

    setRelatorios((atual) => [novo, ...atual]);
    return novo;
  };

  const atualizar = async (id, formulario) => {
    setRelatorios((atual) =>
      atual.map((reporte) =>
        reporte.id === id
          ? {
              ...reporte,
              titulo: formulario.titulo,
              localizacao: formulario.localizacao,
              descricao: formulario.descricao,
              urgencia: formulario.urgencia,
              imagem: formulario.imagem || "",
              multirao: Boolean(formulario.multirao),
            }
          : reporte,
      ),
    );
  };

  const excluir = async (id) => {
    setRelatorios((atual) => atual.filter((reporte) => reporte.id !== id));
  };

  const alterarStatus = async (reporte, novoStatus) => {
    setRelatorios((atual) =>
      atual.map((item) =>
        item.id === reporte.id ? { ...item, status: novoStatus } : item,
      ),
    );
  };

  const alternarParticipacao = async (id, tipo) => {
    setRelatorios((atual) =>
      atual.map((reporte) => {
        if (reporte.id !== id) return reporte;

        const ativa = !reporte.minhaParticipacao?.[tipo];

        return {
          ...reporte,
          minhaParticipacao: {
            ajudando: tipo === "ajudando" ? ativa : Boolean(reporte.minhaParticipacao?.ajudando),
            participando: tipo === "participando" ? ativa : Boolean(reporte.minhaParticipacao?.participando),
          },
          ajudantes: Math.max(0, reporte.ajudantes + (tipo === "ajudando" ? (ativa ? 1 : -1) : 0)),
          participantes: Math.max(0, reporte.participantes + (tipo === "participando" ? (ativa ? 1 : -1) : 0)),
        };
      }),
    );
  };

  const carregarDetalhes = async (id) => {
    const encontrado = relatorios.find((reporte) => reporte.id === id) ?? null;
    if (!encontrado) {
      throw new Error("Reporte não encontrado.");
    }

    return encontrado;
  };

  const enviarMensagem = async (id, texto) => {
    if (!texto || !texto.trim()) {
      throw new Error("Escreva uma mensagem antes de enviar.");
    }

    const novaMensagem = {
      id: Date.now(),
      autor: "Você",
      texto: texto.trim(),
      data: new Date().toISOString(),
    };

    setRelatorios((atual) =>
      atual.map((reporte) =>
        reporte.id === id
          ? { ...reporte, mensagens: [...(reporte.mensagens ?? []), novaMensagem] }
          : reporte,
      ),
    );
  };

  const enviarOferta = async (id, formulario) => {
    if (!formulario?.nome || !formulario?.telefone) {
      throw new Error("Nome e telefone são obrigatórios.");
    }

    const novaOferta = {
      id: Date.now(),
      nome: formulario.nome,
      telefone: formulario.telefone,
      mensagem: formulario.mensagem || "",
      data: new Date().toISOString(),
    };

    setRelatorios((atual) =>
      atual.map((reporte) =>
        reporte.id === id
          ? { ...reporte, ofertas: [...(reporte.ofertas ?? []), novaOferta] }
          : reporte,
      ),
    );
  };

  return useMemo(
    () => ({
      relatorios,
      meusRelatorios,
      estatisticas,
      carregando,
      erro,
      criar,
      atualizar,
      excluir,
      alterarStatus,
      alternarParticipacao,
      carregarDetalhes,
      enviarMensagem,
      enviarOferta,
    }),
    [carregando, erro, estatisticas, meusRelatorios, relatorios],
  );
}
