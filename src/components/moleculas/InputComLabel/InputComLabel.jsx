import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "./InputComLabel.css";

import Rotulo from "../../atomos/Rotulo/Rotulo";
import InputTexto from "../../atomos/InputTexto/Inputexto";

const InputComLabel = ({
  id,
  label,
  tipo = "text",
  placeholder = "Digite aqui",
  valor,
  aoAlterar,
  aoBlur,
  obrigatorio = false,
  desabilitado = false,
  mensagemErro = "",
  dica = "",
  largura = "250px",
  altura = "50px",
}) => {
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  const temErro = Boolean(mensagemErro);
  const cor = temErro ? "erro" : "padrao";

  const ehSenha = tipo === "password";
  const tipoDoInput = ehSenha && senhaVisivel ? "text" : tipo;

  return (
    <div className="input-com-label_root" style={{ width: largura }}>
      {label && (
        <Rotulo texto={label} para={id} cor={cor} obrigatorio={obrigatorio} />
      )}

      <div className="input-com-label_campo">
        <InputTexto
          tipo={tipoDoInput}
          placeholder={placeholder}
          valor={valor}
          aoAlterar={aoAlterar}
          aoBlur={aoBlur}
          cor={cor}
          desabilitado={desabilitado}
          largura="100%"
          altura={altura}
        />

        {ehSenha && (
          <button
            type="button"
            className="input-com-label_olho"
            onClick={() => setSenhaVisivel((visivel) => !visivel)}
            aria-label={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
            tabIndex={-1}
          >
            {senhaVisivel ? <FiEyeOff /> : <FiEye />}
          </button>
        )}
      </div>

      {temErro && (
        <span className="input-com-label_erro">{mensagemErro}</span>
      )}

      {!temErro && dica && (
        <span className="input-com-label_dica">{dica}</span>
      )}
    </div>
  );
};

export default InputComLabel;
