import { useEffect } from "react";
import "./Modal.css";
import Botao from "../../Atoms/Botao";

export default function Modal({
  aberto = false,
  onFechar,
  titulo,
  children,
  onConfirmar,
  rotuloConfirmar = "Confirmar",
  rotuloCancelar = "Cancelar",
  varianteConfirmar = "primario",
  confirmando = false,
  largura = "560px",
}) {
  useEffect(() => {
    if (!aberto) return;

    const aoTeclar = (evento) => {
      if (evento.key === "Escape") onFechar?.();
    };

    window.addEventListener("keydown", aoTeclar);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = "";
    };
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div className="modal-fundo" onClick={onFechar}>
      <div
        className="modal"
        style={{ maxWidth: largura }}
        role="dialog"
        aria-modal="true"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="modal__topo">
          {titulo && <h2 className="modal__titulo">{titulo}</h2>}

          <button
            type="button"
            className="modal__fechar"
            onClick={onFechar}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="modal__conteudo">{children}</div>

        {onConfirmar && (
          <div className="modal__rodape">
            <Botao
              variante="secundario"
              onClick={onFechar}
              desabilitado={confirmando}
              larguraTotal
            >
              {rotuloCancelar}
            </Botao>

            <Botao
              variante={varianteConfirmar}
              onClick={onConfirmar}
              desabilitado={confirmando}
              larguraTotal
            >
              {confirmando ? "Aguarde..." : rotuloConfirmar}
            </Botao>
          </div>
        )}
      </div>
    </div>
  );
}
