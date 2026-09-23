import "./InputTexto.css";
import { useId } from "react";

export default function InputTexto({
 type = "text",
  name,
  id,
  value,
  onChange,
  placeholder = "",
  desabilitado = false,
  erro = false,
  mensagemErro = "",
  tamanho = "medio",
  label,
  obrigatorio = false,
  icone,
}) {
  const idGerado = useId();
  const inputId = id ?? idGerado;

  return (
    <div className="input-container">
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {obrigatorio && <span className="input-obrigatorio">*</span>}
        </label>
      )}

      <div className={`input-campo ${icone ? "input-campo--com-icone" : ""}`}>
        {icone && (
          <span className="input-icone" aria-hidden="true">
            {icone}
          </span>
        )}

        <input
          type={type}
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={desabilitado}
          aria-invalid={erro || undefined}
          className={`input input--${tamanho} ${erro ? "input--erro" : ""}`}
        />
      </div>

      {erro && mensagemErro && (
        <span className="input-mensagem-erro">{mensagemErro}</span>
      )}
    </div>
  );
}