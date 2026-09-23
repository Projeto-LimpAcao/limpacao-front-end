import "./Selecao.css";
import { useId } from "react";

export default function Select({
  label,
  id,
  name,
  value,
  onChange,
  opcoes = [],
  placeholder = "Selecione...",
  desabilitado = false,
  erro = false,
  mensagemErro = "",
  tamanho = "medio",
  obrigatorio = false,
}) {
  const idGerado = useId();
  const selectId = id ?? idGerado;

  return (
    <div className="select-container">
      {label && (
        <label htmlFor={selectId} className="select-label">
          {label}
          {obrigatorio && <span className="select-obrigatorio">*</span>}
        </label>
      )}

      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        disabled={desabilitado}
        aria-invalid={erro || undefined}
        className={`select select--${tamanho} ${erro ? "select--erro" : ""}`}
      >
        {placeholder && <option value="">{placeholder}</option>}

        {opcoes.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.label}
          </option>
        ))}
      </select>

      {erro && mensagemErro && (
        <span className="select-mensagem-erro">{mensagemErro}</span>
      )}
    </div>
  );
}
