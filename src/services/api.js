const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");

export async function requisicaoApi(caminho, opcoes) {
  try {
    return await fetch(`${API_URL}/${caminho}`, opcoes);
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique se o back-end está rodando.",
    );
  }
}
