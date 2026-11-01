import { removerMascara } from "./mascaras";

export const campoPreenchido = (valor) => String(valor ?? "").trim().length > 0;

export const emailValido = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email ?? "").trim());

// mínimo de 8 caracteres
export const senhaForte = (senha) => String(senha ?? "").length >= 8;

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

export const validarCadastro = ({ nome, email, senha, confirmarSenha }) => {
  const erros = {};

  if (!campoPreenchido(nome)) {
    erros.nome = "Informe seu nome.";
  }

  if (!emailValido(email)) {
    erros.email = "Digite um e-mail válido.";
  }

  if (String(senha ?? "").length < 6) {
    erros.senha = "A senha precisa ter pelo menos 6 caracteres.";
  }

  if (String(senha ?? "") !== String(confirmarSenha ?? "")) {
    erros.confirmarSenha = "As senhas não coincidem.";
  }

  return erros;
};
