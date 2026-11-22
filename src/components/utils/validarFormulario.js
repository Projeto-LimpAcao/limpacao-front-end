import { removerMascara } from "./mascaras";

export const campoPreenchido = (valor) => String(valor ?? "").trim().length > 0;

export const emailValido = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email ?? "").trim());

export const REQUISITOS_SENHA = [
  { texto: "Pelo menos 8 caracteres", atende: (senha) => senha.length >= 8 },
  { texto: "Uma letra maiúscula", atende: (senha) => /[A-Z]/.test(senha) },
  { texto: "Uma letra minúscula", atende: (senha) => /[a-z]/.test(senha) },
  { texto: "Um número", atende: (senha) => /\d/.test(senha) },
  { texto: "Um caractere especial (!@#$...)", atende: (senha) => /[^A-Za-z0-9\s]/.test(senha) },
];

export const senhaForte = (senha) =>
  REQUISITOS_SENHA.every(({ atende }) => atende(String(senha ?? "")));

// aceita fixo (10 dígitos) ou celular (11 dígitos), com ou sem máscara
export const telefoneValido = (telefone) => {
  const numeros = removerMascara(telefone);
  return numeros.length === 10 || numeros.length === 11;
};

export const senhasIguais = (senha, confirmacao) =>
  String(senha ?? "").length > 0 && senha === confirmacao;

export const validarLogin = ({ email, senha }) => {
  const erros = {};

  if (!emailValido(email)) {
    erros.email = "Digite um e-mail válido.";
  }

  if (String(senha ?? "").length < 6) {
    erros.senha = "A senha precisa ter pelo menos 6 caracteres.";
  }

  return erros;
};

export const validarRecuperacaoSenha = ({ email }) => {
  const erros = {};

  if (!emailValido(email)) {
    erros.email = "Digite um e-mail válido.";
  }

  return erros;
};

export const validarRedefinicaoSenha = ({ codigo, senha, confirmarSenha }) => {
  const erros = {};

  if (!/^\d{6}$/.test(String(codigo ?? ""))) {
    erros.codigo = "O código deve ter 6 dígitos.";
  }

  if (!senhaForte(senha)) {
    erros.senha = "A senha não atende aos requisitos de segurança.";
  }

  if (String(senha ?? "") !== String(confirmarSenha ?? "")) {
    erros.confirmarSenha = "As senhas não coincidem.";
  }

  return erros;
};

export const validarCadastro =({ nome, email, senha, confirmarSenha }) => {
  const erros = {};

  if (!campoPreenchido(nome)) {
    erros.nome = "Informe seu nome.";
  }

  if (!emailValido(email)) {
    erros.email = "Digite um e-mail válido.";
  }

  if (!senhaForte(senha)) {
    erros.senha = "A senha não atende aos requisitos de segurança.";
  }

  if (String(senha ?? "") !== String(confirmarSenha ?? "")) {
    erros.confirmarSenha = "As senhas não coincidem.";
  }

  return erros;
};
