import { useId } from "react";
import "./RadioGrupo.css";

export default function RadioGrupo({ label, valor, onChange, opcoes = [] }) {
  
  const nome = useId();

  return (
    <fieldset className="radio-grupo">
      {label && <legend className="radio-grupo__label">{label}</legend>}

      <div className="radio-grupo__opcoes">
        {opcoes.map((opcao) => (
          <label key={String(opcao.valor)} className="radio-grupo__opcao">
            <input
              type="radio"
              name={nome}
              checked={valor === opcao.valor}
              onChange={() => onChange(opcao.valor)}
              className="radio-grupo__input"
            />
            <span>{opcao.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
