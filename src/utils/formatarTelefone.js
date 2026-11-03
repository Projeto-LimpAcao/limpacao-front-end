export function formatarTelefone(valor) {
  const digitos = String(valor ?? "").replace(/\D/g, "").slice(0, 11);
  if (!digitos) return "";
  if (digitos.length === 1) return `(${digitos}`;

  const ddd = digitos.slice(0, 2);
  const numero = digitos.slice(2);
  const tamanhoPrefixo = digitos.length === 11 ? 5 : 4;

  if (numero.length <= tamanhoPrefixo) {
    return numero ? `(${ddd}) ${numero}` : `(${ddd})`;
  }

  return `(${ddd}) ${numero.slice(0, tamanhoPrefixo)}-${numero.slice(tamanhoPrefixo)}`;
}

export function removerDigitoAnteriorTelefone(valor, posicaoInicio, posicaoFim) {
  if (posicaoInicio !== posicaoFim || posicaoInicio === 0) return null;

  const texto = String(valor ?? "");
  const trechoAnterior = texto.slice(0, posicaoInicio);
  if (/\d$/.test(trechoAnterior)) return null;

  const digitos = texto.replace(/\D/g, "");
  const digitosAntesDoCursor = trechoAnterior.replace(/\D/g, "").length;
  const indiceRemover = digitosAntesDoCursor - 1;
  if (indiceRemover < 0) return null;

  const novoValor = formatarTelefone(
    digitos.slice(0, indiceRemover) + digitos.slice(indiceRemover + 1),
  );
  const quantidadeDigitosAntesDoCursor = Math.max(0, digitosAntesDoCursor - 1);
  let novaPosicao = 0;
  let digitosPercorridos = 0;

  while (novaPosicao < novoValor.length && digitosPercorridos < quantidadeDigitosAntesDoCursor) {
    if (/\d/.test(novoValor[novaPosicao])) digitosPercorridos += 1;
    novaPosicao += 1;
  }

  return { valor: novoValor, posicao: novaPosicao };
}
