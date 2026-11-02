import { useCallback, useEffect, useMemo, useState } from "react";
import * as relatoriosService from "../services/relatoriosService";

export function calcularTaxaResolucao(reportes) {
  if (reportes.length === 0) return 0;
  const resolvidos = reportes.filter(
    (reporte) => reporte.status === "resolved",
  ).length;
  return Math.round((resolvidos / reportes.length) * 100);
}

export function calcularEstatisticas(reportes, usuarioAutenticado, exigirMeus) {
  const meusRelatorios = reportes.filter((reporte) => reporte.souDono);
  const reportesDaVisao = exigirMeus ? meusRelatorios : reportes;
  const reportesParaTaxa = usuarioAutenticado ? meusRelatorios : reportes;

  return {
    total: reportesDaVisao.length,
    resolvidos: reportesDaVisao.filter((reporte) => reporte.status === "resolved").length,
    emAndamento: reportesDaVisao.filter((reporte) => reporte.status === "in-progress").length,
    meus: meusRelatorios.length,
    taxaResolucao: calcularTaxaResolucao(reportesParaTaxa),
    taxaResolucaoGeral: calcularTaxaResolucao(reportes),
    taxaIndividual: usuarioAutenticado,
  };
}

export function useRelatorios(usuarioAutenticado = false, exigirMeus = false) {
  const [relatorios, setRelatorios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    relatoriosService
      .listarReportes(usuarioAutenticado, exigirMeus)
      .then((resultado) => {
        if (ativo) setRelatorios(resultado);
      })
      .catch((problema) => {
        if (ativo) setErro(problema.message);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [exigirMeus, usuarioAutenticado]);

  const meusRelatorios = useMemo(
    () => relatorios.filter((reporte) => reporte.souDono),
    [relatorios],
  );

  const estatisticas = useMemo(() => {
    return calcularEstatisticas(relatorios, usuarioAutenticado, exigirMeus);
  }, [exigirMeus, relatorios, usuarioAutenticado]);

  const criar = async (formulario) => {
    if (!usuarioAutenticado) {
      throw new Error("Entre na sua conta para cadastrar um reporte.");
    }

    const novo = await relatoriosService.criarReporte(formulario);
    setRelatorios((atual) => [novo, ...atual]);
    return novo;
  };

  const atualizar = async (id, formulario) => {
    const atualizado = await relatoriosService.atualizarReporte(id, formulario);
    setRelatorios((atual) =>
      atual.map((reporte) =>
        reporte.id === id
          ? {
              ...reporte,
              ...atualizado,
              mensagens: reporte.mensagens,
              quantidadeMensagens: reporte.quantidadeMensagens,
              ofertas: reporte.ofertas,
              minhaParticipacao: reporte.minhaParticipacao,
            }
          : reporte,
      ),
    );
  };

  const excluir = async (id) => {
    await relatoriosService.excluirReporte(id);
    setRelatorios((atual) => atual.filter((reporte) => reporte.id !== id));
  };

  const alterarStatus = async (reporte, novoStatus) => {
    const atualizado = await relatoriosService.atualizarStatusReporte(
      reporte.id,
      novoStatus,
    );

    setRelatorios((atual) =>
      atual.map((item) =>
        item.id === reporte.id
          ? {
              ...item,
              ...atualizado,
              mensagens: item.mensagens,
              quantidadeMensagens: item.quantidadeMensagens,
              ofertas: item.ofertas,
              minhaParticipacao: item.minhaParticipacao,
            }
          : item,
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

  const registrarMensagemRecebida = useCallback((id, mensagem) => {
    setRelatorios((atual) =>
      atual.map((reporte) => {
        if (reporte.id !== id) return reporte;
        if ((reporte.mensagens ?? []).some((item) => item.id === mensagem.id)) {
          return reporte;
        }

        const mensagens = [...(reporte.mensagens ?? []), mensagem];
        return {
          ...reporte,
          mensagens,
          quantidadeMensagens:
            Math.max(
              reporte.quantidadeMensagens ?? 0,
              reporte.mensagens?.length ?? 0,
            ) + 1,
        };
      }),
    );
  }, []);

  const registrarHistoricoMensagens = useCallback((id, mensagens) => {
    setRelatorios((atual) =>
      atual.map((reporte) =>
        reporte.id === id
          ? {
              ...reporte,
              mensagens,
              quantidadeMensagens: mensagens.length,
            }
          : reporte,
      ),
    );
  }, []);

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

  return {
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
    registrarHistoricoMensagens,
    enviarMensagem,
    registrarMensagemRecebida,
    enviarOferta,
  };
}
