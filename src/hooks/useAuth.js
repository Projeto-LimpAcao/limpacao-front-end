import { useMemo, useState } from "react";
import * as authService from "../services/authService";

export function useAuth() {
  const [usuario, setUsuario] = useState(() => authService.lerUsuarioSalvo());

  const entrar = async (email, senha) => {
    const usuarioLogado = await authService.entrar(email, senha);
    setUsuario(usuarioLogado);
    return true;
  };

  const cadastrar = async (nome, email, senha) => {
    const usuarioLogado = await authService.cadastrar(nome, email, senha);
    setUsuario(usuarioLogado);
    return true;
  };

  const sair = () => {
    setUsuario(null);
    authService.sair();
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
