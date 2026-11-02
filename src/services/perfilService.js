import { requisicaoApi } from "./api";

export async function atualizarPerfil(dados) {
  const resposta = await requisicaoApi("usuarios/me/perfil", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  if (!resposta.ok) {
    let detalhe = "";
    try {
      const erro = await resposta.json();
      detalhe = erro.detail ?? erro.message ?? "";
    } catch {
      if (resposta.status !== 401) {
        throw new Error(
          `Não foi possível atualizar o perfil (${resposta.status}).`,
        );
      }
    }

    throw new Error(
      detalhe ||
        (resposta.status === 401
          ? dados.novaSenha
            ? "A senha atual está incorreta."
            : "Sua sessão expirou. Entre novamente para continuar."
          : `Não foi possível atualizar o perfil (${resposta.status}).`),
    );
  }

  const perfil = await resposta.json();
  if (!perfil.nome || !perfil.email) {
    throw new Error("O servidor retornou dados de perfil inválidos.");
  }
  return perfil;
}
