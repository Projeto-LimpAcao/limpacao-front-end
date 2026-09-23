import "./Logo.css";
import { MARCA, NOME_PROJETO, SUBTITULO_PROJETO } from "../../../config/projeto";

export default function Logo({
  tamanho = "medio",
  centralizado = false,
  mostrarTexto = true,
}) {
  return (
    <div
      className={`logo logo--${tamanho} ${centralizado ? "logo--centralizado" : ""}`}
    >
      <span className="logo__marca">{MARCA || NOME_PROJETO.charAt(0)}</span>

      {mostrarTexto && (
        <span className="logo__textos">
          <strong className="logo__nome">{NOME_PROJETO}</strong>
          <span className="logo__subtitulo">{SUBTITULO_PROJETO}</span>
        </span>
      )}
    </div>
  );
}
