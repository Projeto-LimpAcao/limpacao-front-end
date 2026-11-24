import { describe, expect, it } from "vitest";

import {
  emailValido,
  senhaForte,
  telefoneValido,
  validarCadastro,
  validarLogin,
  validarRedefinicaoSenha,
} from "../components/utils/validarFormulario";

describe("validarFormulario", () => {
  it("valida e-mail", () => {
    expect(emailValido("ana@exemplo.com")).toBe(true);
    expect(emailValido("  ana@exemplo.com  ")).toBe(true);
    expect(emailValido("ana@exemplo")).toBe(false);
    expect(emailValido("")).toBe(false);
    expect(emailValido(null)).toBe(false);
  });

  it("exige senha forte", () => {
    expect(senhaForte("Limpa@2026")).toBe(true);
    expect(senhaForte("limpa@2026")).toBe(false);
    expect(senhaForte("LIMPA@2026")).toBe(false);
    expect(senhaForte("Limpa2026")).toBe(false);
    expect(senhaForte("Li@1")).toBe(false);
    expect(senhaForte(undefined)).toBe(false);
  });

  it("aceita telefone fixo e celular", () => {
    expect(telefoneValido("(48) 3333-4444")).toBe(true);
    expect(telefoneValido("(48) 99999-8888")).toBe(true);
    expect(telefoneValido("4899")).toBe(false);
  });

  it("valida o login", () => {
    expect(validarLogin({ email: "ana@exemplo.com", senha: "123456" })).toEqual({});
    expect(validarLogin({ email: "x", senha: "123" })).toEqual({
      email: "Digite um e-mail válido.",
      senha: "A senha precisa ter pelo menos 6 caracteres.",
    });
  });

  it("valida o cadastro", () => {
    expect(
      validarCadastro({
        nome: "Ana",
        email: "ana@exemplo.com",
        senha: "Limpa@2026",
        confirmarSenha: "Limpa@2026",
      }),
    ).toEqual({});

    const erros = validarCadastro({ nome: " ", email: "ana", senha: "fraca", confirmarSenha: "outra" });
    expect(Object.keys(erros).sort()).toEqual(["confirmarSenha", "email", "nome", "senha"]);
  });

  it("valida a redefinição de senha", () => {
    expect(
      validarRedefinicaoSenha({ codigo: "123456", senha: "Limpa@2026", confirmarSenha: "Limpa@2026" }),
    ).toEqual({});
    expect(validarRedefinicaoSenha({ codigo: "12a", senha: "Limpa@2026", confirmarSenha: "Limpa@2026" }))
      .toHaveProperty("codigo");
  });
});
