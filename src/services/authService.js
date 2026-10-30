import { requisicaoApi } from "./api";

const STORAGE_KEY = "limpacao-auth";
const TOKEN_KEY = "limpacao-token";

async function autenticar(endpoint, dados) {
  const resposta = await requisicaoApi(`auth/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  if (!resposta.ok) {
    if (resposta.status === 401) {
      throw new Error("E-mail ou senha inválidos.");
    }

    if (endpoint === "register" && resposta.status === 400) {
      throw new Error("Este e-mail já está cadastrado.");
    }

    throw new Error(
      `O servidor não conseguiu concluir a solicitação (${resposta.status}).`,
    );
  }

  const sessao = await resposta.json();
  if (!sessao.token || !sessao.email || !sessao.nome) {
    throw new Error("O servidor retornou dados de autenticação inválidos.");
  }

  const usuario = { nome: sessao.nome, email: sessao.email };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
  localStorage.setItem(TOKEN_KEY, sessao.token);
  return usuario;
}

export function entrar(email, senha) {
  if (!email || !senha) {
    throw new Error("E-mail e senha são obrigatórios.");
  }

  return autenticar("login", { email: email.trim(), senha });
}

export function cadastrar(nome, email, senha) {
  if (!nome || !email || !senha) {
    throw new Error("Preencha todos os campos para continuar.");
  }

  return autenticar("register", {
    nome: nome.trim(),
    email: email.trim(),
    senha,
  });
}

export function lerUsuarioSalvo() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const salvo = localStorage.getItem(STORAGE_KEY);
    return token && salvo ? JSON.parse(salvo) : null;
  } catch {
    return null;
  }
}

export function sair() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TOKEN_KEY);
}
