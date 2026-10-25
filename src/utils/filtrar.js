export function filtrarReportes(lista = [], filtros = {}) {
  const termo = (filtros.busca ?? "").trim().toLowerCase();
  const urgencia = filtros.urgencia ?? "todas";
  const status = filtros.status ?? "todos";
  const ordenacao = filtros.ordenacao ?? "recente";

  const resultado = (lista ?? []).filter((reporte) => {
    const matchBusca =
      !termo ||
      reporte.titulo?.toLowerCase().includes(termo) ||
      reporte.localizacao?.toLowerCase().includes(termo);

    const matchUrgencia =
      urgencia === "todas" || reporte.urgencia === urgencia;

    const matchStatus =
      status === "todos" || reporte.status === status;

    return matchBusca && matchUrgencia && matchStatus;
  });

  resultado.sort((a, b) => {
    const dataA = new Date(a.data).getTime();
    const dataB = new Date(b.data).getTime();

    switch (ordenacao) {
      case "antigo":
        return dataA - dataB;
      case "urgencia":
        return (b.urgencia === "alta" ? 1 : 0) - (a.urgencia === "alta" ? 1 : 0);
      case "recente":
      default:
        return dataB - dataA;
    }
  });

  return resultado;
}
