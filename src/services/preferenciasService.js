import { requisicaoApi } from "./api";

async function validarResposta(resposta) {
  if (resposta.ok) return;
  if (resposta.status === 401) {
    throw new Error("Sua sessão expirou. Entre novamente para continuar.");
  }
  throw new Error(
    `Não foi possível salvar as preferências (${resposta.status}).`,
  );
}

export async function buscarPreferencias() {
  const resposta = await requisicaoApi("usuarios/me/preferencias");
  await validarResposta(resposta);
  return resposta.json();
}

export async function salvarPreferencias(preferencias) {
  const resposta = await requisicaoApi("usuarios/me/preferencias", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(preferencias),
  });
  await validarResposta(resposta);
  return resposta.json();
}
