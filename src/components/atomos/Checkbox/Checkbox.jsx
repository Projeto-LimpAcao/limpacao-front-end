import { useId } from "react";
import "./Checkbox.css";

export default function Checkbox({
  marcado = false,
  onChange,
  id,
  label = "",
  descricao = "",
  desabilitado = false,
  erro = false,
  tamanho = "medio",
  name,
}) {
  // useId é sempre chamado (regra dos hooks); só usamos se não vier um id.
  const idGerado = useId();
  const checkboxId = id ?? idGerado;

  return (
    <label
      htmlFor={checkboxId}
      className={[
        "checkbox",
        `checkbox--${tamanho}`,
        erro ? "checkbox--erro" : "",
        desabilitado ? "checkbox--desabilitado" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        type="checkbox"
        id={checkboxId}
        checked={marcado}
        onChange={onChange}
        disabled={desabilitado}
        name={name}
        className="checkbox__input"
      />

      {(label || descricao) && (
        <span className="checkbox__texto">
          {label && <span className="checkbox__label">{label}</span>}
          {descricao && (
            <span className="checkbox__descricao">{descricao}</span>
          )}
        </span>
      )}
    </label>
  );
}
