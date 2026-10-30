const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");

export async function requisicaoApi(caminho, opcoes) {
  const headers = new Headers(opcoes?.headers);
  const token = localStorage.getItem("limpacao-token");

  if (token && !headers.has("Authorization")) {
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
