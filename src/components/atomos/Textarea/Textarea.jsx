import { useId } from "react";
import "./Textarea.css";

/**
 * Campo de texto grande (várias linhas).
 *
 * Exemplo:
 *   <Textarea
 *     label="Descrição"
 *     obrigatorio
 *     linhas={4}
 *     value={descricao}
 *     onChange={(e) => setDescricao(e.target.value)}
 *   />
 */
export default function Textarea({
  label,
  id,
  name,
  value,
  onChange,
  placeholder = "",
  linhas = 4,
  desabilitado = false,
  erro = false,
  mensagemErro = "",
  obrigatorio = false,
}) {
  const idGerado = useId();
  const campoId = id ?? idGerado;

  return (
    <div className="textarea-container">
      {label && (
        <label htmlFor={campoId} className="textarea-label">
          {label}
          {obrigatorio && <span className="textarea-obrigatorio">*</span>}
        </label>
      )}

      <textarea
        id={campoId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={linhas}
        disabled={desabilitado}
        aria-invalid={erro || undefined}
        className={`textarea ${erro ? "textarea--erro" : ""}`}
      />

      {erro && mensagemErro && (
        <span className="textarea-mensagem-erro">{mensagemErro}</span>
      )}
    </div>
  );
}
