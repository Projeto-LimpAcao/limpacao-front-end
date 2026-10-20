/** "2026-08-22" → "22/08/2026" */
export function formatarData(data) {
  if (!data) return "";

  const objeto = new Date(data);
  if (Number.isNaN(objeto.getTime())) return String(data);

  return objeto.toLocaleDateString("pt-BR");
}

/** "2026-08-22T14:30" → "22/08/2026 14:30" */
export function formatarDataHora(data) {
  if (!data) return "";

  const objeto = new Date(data);
  if (Number.isNaN(objeto.getTime())) return String(data);

  return objeto.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
/** Lê um arquivo de imagem e devolve a versão em texto (data URL). */
export function lerImagemComoTexto(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();

    leitor.onload = () => resolve(leitor.result);
    leitor.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    leitor.readAsDataURL(arquivo);
  });
}
