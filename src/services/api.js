const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");

/* Monta a URL de um arquivo salvo no backend ("/api/arquivos/...")
   respeitando o endereço da API configurado em VITE_API_URL. */
export function urlArquivo(caminho) {
  if (typeof caminho !== "string" || !caminho.startsWith("/api/")) {
    return caminho;
  }
  return `${API_URL}/${caminho.slice("/api/".length)}`;
}

export async function requisicaoApi(
  caminho,
  { semAutenticacao = false, ...opcoes } = {},
) {
  const headers = new Headers(opcoes?.headers);
  const token = localStorage.getItem("limpacao-token");

  if (!semAutenticacao && token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    return await fetch(`${API_URL}/${caminho}`, {
      ...opcoes,
      headers,
    });
  } catch (problema) {
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique se o back-end está rodando.",
      { cause: problema },
    );
  }
}
