// Cada "#" na máscara vira um dígito; os demais caracteres são fixos.
export const MASCARA_TELEFONE = "(##) #####-####";
export const MASCARA_CPF = "###.###.###-##";
export const MASCARA_CNPJ = "##.###.###/####-##";
export const MASCARA_CEP = "#####-###";
export const MASCARA_DATA = "##/##/####";

export const formatarComMascara = (valor, mascara) => {
  const numeros = String(valor ?? "").replace(/\D/g, "");

  let resultado = "";
  let indice = 0;

  for (const caractere of mascara) {
    if (indice >= numeros.length) break;

    if (caractere === "#") {
      resultado += numeros[indice];
      indice += 1;
    } else {
      resultado += caractere;
    }
  }

  return resultado;
};

export const removerMascara = (valor) => String(valor ?? "").replace(/\D/g, "");
