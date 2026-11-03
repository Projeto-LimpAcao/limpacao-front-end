export function resolverOfertaConversaAjuda(reportes, ofertaId) {
  if (ofertaId === null) return null;

  for (const reporte of reportes) {
    const ofertaRecebida = (reporte.ofertas ?? []).find(
      (oferta) => oferta.id === ofertaId,
    );
    if (ofertaRecebida) {
      return { ...ofertaRecebida, reporteTitulo: reporte.titulo };
    }
  }

  const reporteDaOfertaEnviada = reportes.find(
    (reporte) => reporte.minhaOfertaId === ofertaId,
  );
  if (!reporteDaOfertaEnviada) return null;

  return {
    id: reporteDaOfertaEnviada.minhaOfertaId,
    nome: reporteDaOfertaEnviada.autor,
    reporteTitulo: reporteDaOfertaEnviada.titulo,
  };
}
