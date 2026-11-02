import { useCallback, useMemo, useSyncExternalStore } from "react";
import * as authService from "../services/authService";
import { atualizarPerfil as salvarPerfil } from "../services/perfilService";

let usuarioAtual = authService.lerUsuarioSalvo();
const assinantes = new Set();

function assinar(listener) {
  assinantes.add(listener);
  return () => assinantes.delete(listener);
}

function obterUsuario() {
  return usuarioAtual;
}

function atualizarUsuario(usuario) {
  usuarioAtual = usuario;
  assinantes.forEach((listener) => listener());
}

export function useAuth() {
  const usuario = useSyncExternalStore(assinar, obterUsuario, obterUsuario);

  const entrar = useCallback(async (email, senha) => {
    const usuarioLogado = await authService.entrar(email, senha);
    atualizarUsuario(usuarioLogado);
    return true;
  }, []);

  const cadastrar = useCallback(async (nome, email, senha) => {
    const usuarioLogado = await authService.cadastrar(nome, email, senha);
    atualizarUsuario(usuarioLogado);
    return true;
  }, []);

  const sair = useCallback(() => {
    authService.sair();
    atualizarUsuario(null);
  }, []);

  const atualizarPerfil = useCallback(async (dados) => {
    const usuarioAtualizado = await salvarPerfil(dados);
    authService.atualizarUsuarioSalvo(usuarioAtualizado);
    atualizarUsuario(usuarioAtualizado);
    return usuarioAtualizado;
  }, []);

  return useMemo(
    () => ({
      usuario,
      estaLogado: Boolean(usuario),
      entrar,
      cadastrar,
      sair,
      atualizarPerfil,
    }),
    [atualizarPerfil, cadastrar, entrar, sair, usuario],
  );
}
