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

export function associarOfertasAjuda(reportes, ofertas) {
  const ofertasPorReporte = new Map();
  ofertas.forEach((oferta) => {
    const doReporte = ofertasPorReporte.get(oferta.relatorioId) ?? [];
    doReporte.push({ ...oferta, data: oferta.criadoEm ?? oferta.data });
    ofertasPorReporte.set(oferta.relatorioId, doReporte);
  });

  return reportes.map((reporte) => {
    if (!reporte.souDono) return reporte;
    return {
      ...reporte,
      ofertas: ofertasPorReporte.get(reporte.id) ?? [],
    };
  });
}

export function associarMensagensNaoLidas(reportes, notificacoes) {
  const quantidades = new Map(
    notificacoes.map(({ ofertaId, quantidade }) => [ofertaId, quantidade]),
  );

  return reportes.map((reporte) => {
    const ofertas = (reporte.ofertas ?? []).map((oferta) => ({
      ...oferta,
      mensagensNaoLidas: quantidades.get(oferta.id) ?? 0,
    }));
    const mensagensDaMinhaOferta = quantidades.get(reporte.minhaOfertaId) ?? 0;
    const mensagensDoReporte = reporte.souDono
      ? ofertas.reduce((total, oferta) => total + oferta.mensagensNaoLidas, 0)
      : mensagensDaMinhaOferta;

    return {
      ...reporte,
      ofertas,
      mensagensNaoLidas: mensagensDoReporte,
      mensagensNaoLidasMinhaOferta: mensagensDaMinhaOferta,
    };
  });
}

export function listarMensagensNaoVisualizadas(reportes) {
  return reportes.flatMap((reporte) =>
    reporte.souDono
      ? (reporte.ofertas ?? [])
          .filter((oferta) => oferta.mensagensNaoLidas > 0)
          .map((oferta) => ({
            ...oferta,
            tituloReporte: reporte.titulo,
          }))
      : [],
  );
}

export function validarFormularioOferta(formulario) {
  if (!formulario?.telefone?.trim()) {
    throw new Error("O telefone é obrigatório.");
  }
  if (!formulario?.mensagem?.trim()) {
    throw new Error("Descreva como você pode ajudar.");
  }
}

export function useRelatorios(usuarioAutenticado = false, exigirMeus = false) {
  const [relatorios, setRelatorios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [erroOfertas, setErroOfertas] = useState("");
  const [erroMensagensNaoLidas, setErroMensagensNaoLidas] = useState("");
  const [mensagensNaoLidas, setMensagensNaoLidas] = useState([]);

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

  useEffect(() => {
    if (!usuarioAutenticado) return undefined;

    let ativo = true;
    let atualizando = false;
    const atualizarOfertas = async () => {
      if (atualizando) return;
      atualizando = true;

      try {
        const ofertas = await relatoriosService.listarOfertasAjudaMeus();
        if (!ativo) return;
        setRelatorios((atual) => associarOfertasAjuda(atual, ofertas));
        setErroOfertas("");
      } catch (problema) {
        if (ativo) setErroOfertas(problema.message);
      } finally {
        atualizando = false;
      }
    };

    const temporizador = window.setInterval(atualizarOfertas, 10000);
    window.addEventListener("focus", atualizarOfertas);

    return () => {
      ativo = false;
      window.clearInterval(temporizador);
      window.removeEventListener("focus", atualizarOfertas);
    };
  }, [usuarioAutenticado]);

  useEffect(() => {
    if (!usuarioAutenticado) return undefined;

    let ativo = true;
    let consultando = false;
    const atualizarMensagensNaoLidas = async () => {
      if (consultando) return;
      consultando = true;
      try {
        const notificacoes =
          await relatoriosService.listarMensagensAjudaNaoLidas();
        if (ativo) {
          setMensagensNaoLidas(notificacoes);
          setErroMensagensNaoLidas("");
        }
      } catch (problema) {
        if (ativo) setErroMensagensNaoLidas(problema.message);
      } finally {
        consultando = false;
      }
    };

    void atualizarMensagensNaoLidas();
    const temporizador = window.setInterval(atualizarMensagensNaoLidas, 10000);
    window.addEventListener("focus", atualizarMensagensNaoLidas);

    return () => {
      ativo = false;
      window.clearInterval(temporizador);
      window.removeEventListener("focus", atualizarMensagensNaoLidas);
    };
  }, [usuarioAutenticado]);

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

  const marcarMensagensLidas = useCallback((ofertaId) => {
    setMensagensNaoLidas((atuais) =>
      atuais.filter((notificacao) => notificacao.ofertaId !== ofertaId),
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
    validarFormularioOferta(formulario);

    const novaOferta = await relatoriosService.criarOfertaAjuda(
      id,
      formulario,
    );

    setRelatorios((atual) =>
      atual.map((reporte) =>
        reporte.id === id
          ? {
              ...reporte,
              ofertas: [
                ...(reporte.ofertas ?? []),
                { ...novaOferta, data: novaOferta.criadoEm },
              ],
              minhaOfertaId: novaOferta.id,
              minhaParticipacao: {
                ...reporte.minhaParticipacao,
                ajudando: true,
              },
            }
          : reporte,
      ),
    );
    return novaOferta;
  };

  const relatoriosComNotificacoes = useMemo(
    () => associarMensagensNaoLidas(
      relatorios,
      usuarioAutenticado ? mensagensNaoLidas : [],
    ),
    [mensagensNaoLidas, relatorios, usuarioAutenticado],
  );

  const meusRelatorios = useMemo(
    () => relatoriosComNotificacoes.filter((reporte) => reporte.souDono),
    [relatoriosComNotificacoes],
  );

  return {
    relatorios: relatoriosComNotificacoes,
    meusRelatorios,
    estatisticas,
    carregando,
    erro,
    erroOfertas,
    erroMensagensNaoLidas: usuarioAutenticado ? erroMensagensNaoLidas : "",
    criar,
    atualizar,
    excluir,
    alterarStatus,
    alternarParticipacao,
    carregarDetalhes,
    registrarHistoricoMensagens,
    marcarMensagensLidas,
    enviarMensagem,
    registrarMensagemRecebida,
    enviarOferta,
  };
}
