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

export const LIMITE_IMAGENS = 5;
const TAMANHO_MAXIMO_IMAGEM = 5 * 1024 * 1024;
const TIPOS_IMAGEM_SUPORTADOS = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

/**
 * Valida os arquivos escolhidos (formato, tamanho e limite) e converte os
 * válidos em data URL. Devolve as imagens e os avisos dos que ficaram de fora.
 */
export async function prepararImagens(arquivos, quantidadeAtual = 0) {
  const espacoDisponivel = LIMITE_IMAGENS - quantidadeAtual;
  const validos = [];
  const erros = [];

  arquivos.forEach((arquivo) => {
    if (!TIPOS_IMAGEM_SUPORTADOS.includes(arquivo.type)) {
      erros.push(`${arquivo.name}: formato não suportado.`);
    } else if (arquivo.size > TAMANHO_MAXIMO_IMAGEM) {
      erros.push(`${arquivo.name}: tamanho máximo de 5 MB.`);
    } else if (validos.length < espacoDisponivel) {
      validos.push(arquivo);
    } else {
      erros.push(`É possível anexar no máximo ${LIMITE_IMAGENS} imagens.`);
    }
  });

  const imagens = await Promise.all(validos.map(lerImagemComoTexto));
  if (imagens.some((imagem) => typeof imagem !== "string")) {
    throw new Error("Não foi possível converter uma das imagens.");
  }

  return { imagens, erros: [...new Set(erros)] };
}

export function ehEmailValido(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
