import { Check } from "lucide-react";

import "./RequisitosSenha.css";
import { REQUISITOS_SENHA } from "../../utils/validarFormulario";

const nivelSenha = (atendidos, total) => {
  if (atendidos === total) return { nome: "forte", rotulo: "Forte" };
  if (atendidos >= 3) return { nome: "media", rotulo: "Média" };
  return { nome: "fraca", rotulo: "Fraca" };
};

export default function RequisitosSenha({ senha = "" }) {
  const requisitos = REQUISITOS_SENHA.map(({ texto, atende }) => ({
    texto,
    ok: atende(senha),
  }));
  const atendidos = requisitos.filter(({ ok }) => ok).length;
  const total = requisitos.length;
  const nivel = nivelSenha(atendidos, total);

  return (
    <div className={`requisitos-senha requisitos-senha--${nivel.nome}`}>
      <div className="requisitos-senha__topo">
        <span>Força da senha</span>
        <strong className="requisitos-senha__nivel">
          {senha ? nivel.rotulo : "—"}
        </strong>
      </div>

      <div
        className="requisitos-senha__barra"
        role="progressbar"
        aria-label="Força da senha"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={atendidos}
      >
        <span style={{ width: `${(atendidos / total) * 100}%` }} />
      </div>

      <ul className="requisitos-senha__lista" aria-label="Requisitos da senha">
        {requisitos.map(({ texto, ok }) => (
          <li
            key={texto}
            className={`requisitos-senha__item ${ok ? "requisitos-senha__item--ok" : ""}`}
          >
            <span className="requisitos-senha__icone" aria-hidden="true">
              {ok && <Check size={11} strokeWidth={3} />}
            </span>
            <span>{texto}</span>
            <span className="requisitos-senha__sr">
              {ok ? " (atendido)" : " (pendente)"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
