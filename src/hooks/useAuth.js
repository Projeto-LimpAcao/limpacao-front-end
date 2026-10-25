import { useMemo, useState } from "react";

const STORAGE_KEY = "limpacao-auth";

function lerUsuarioSalvo() {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    return salvo ? JSON.parse(salvo) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [usuario, setUsuario] = useState(() => lerUsuarioSalvo());

  const entrar = async (email, senha) => {
    if (!email || !senha) {
      throw new Error("E-mail e senha são obrigatórios.");
    }

    const nome = (email.split("@")[0] || "Usuário").trim();
    const usuarioLogado = {
      nome: nome.charAt(0).toUpperCase() + nome.slice(1),
      email: email.trim(),
    };

    setUsuario(usuarioLogado);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarioLogado));
    return true;
  };

  const cadastrar = async (nome, email, senha) => {
    if (!nome || !email || !senha) {
      throw new Error("Preencha todos os campos para continuar.");
    }

    const usuarioLogado = {
      nome: nome.trim(),
      email: email.trim(),
    };

    setUsuario(usuarioLogado);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarioLogado));
    return true;
  };

  const sair = () => {
    setUsuario(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return useMemo(
    () => ({
      usuario,
      estaLogado: Boolean(usuario),
      entrar,
      cadastrar,
      sair,
    }),
    [usuario],
  );
}
