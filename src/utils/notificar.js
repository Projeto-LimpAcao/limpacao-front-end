import { toast } from "react-toastify";

const mostrar = (tipo) => (mensagem) => {
  if (!mensagem) return;
  toast[tipo](mensagem, { toastId: mensagem });
};

export const notificar = {
  sucesso: mostrar("success"),
  erro: mostrar("error"),
  aviso: mostrar("warning"),
  info: mostrar("info"),
  camposObrigatorios: (erros = {}) =>
    mostrar("warning")(
      Object.values(erros).find(Boolean) ??
        "Preencha corretamente os campos obrigatórios.",
    ),
};
