const BRASIL_API_URL = "https://brasilapi.com.br/api/cep/v1";

export async function buscarEnderecoPorCep(cepInformado, { signal } = {}) {
  const cep = String(cepInformado ?? "").replace(/\D/g, "");
  if (cep.length !== 8) {
    throw new Error("Digite um CEP com 8 números.");
  }

  let resposta;
  try {
    resposta = await fetch(`${BRASIL_API_URL}/${cep}`, { signal });
  } catch (problema) {
    if (problema.name === "AbortError") throw problema;
    throw new Error(
      "Não foi possível consultar o CEP. Verifique sua conexão e tente novamente.",
      { cause: problema },
    );
  }

  if (resposta.status === 404) {
    throw new Error("CEP não encontrado. Confira os números e tente novamente.");
  }
  if (!resposta.ok) {
    throw new Error("Não foi possível consultar o CEP agora. Tente novamente.");
  }

  const endereco = await resposta.json();
  return {
    cep: endereco.cep || `${cep.slice(0, 5)}-${cep.slice(5)}`,
    rua: endereco.street || "",
    bairro: endereco.neighborhood || "",
    cidade: endereco.city || "",
    estado: endereco.state || "",
  };
}
