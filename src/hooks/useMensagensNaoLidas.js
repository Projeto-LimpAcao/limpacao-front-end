import { useEffect, useState } from "react";
import { listarMensagensAjudaNaoLidas } from "../services/relatoriosService";

export function useMensagensNaoLidas(estaLogado) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!estaLogado) return undefined;

    let ativo = true;
    const atualizar = async () => {
      try {
        const notificacoes = await listarMensagensAjudaNaoLidas();
        if (ativo) {
          setTotal(
            notificacoes.reduce((soma, { quantidade }) => soma + quantidade, 0),
          );
        }
      } catch {
        return;
      }
    };

    void atualizar();
    const temporizador = window.setInterval(atualizar, 10000);
    window.addEventListener("focus", atualizar);

    return () => {
      ativo = false;
      window.clearInterval(temporizador);
      window.removeEventListener("focus", atualizar);
    };
  }, [estaLogado]);

  return estaLogado ? total : 0;
}
