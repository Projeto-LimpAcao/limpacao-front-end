import "./CampoFormulario.css";
import Rotulo from "../../atomos/Rotulo/Rotulo";
import InputTexto from "../../atomos/InputTexto/Inputexto";

const CampoFormulario = ({
  id,
  rotulo,
  valor,
  tipo = "text",
  placeholder,
  aoAlterar,
  aoBlur,
  obrigatorio = false,
  erro,
  largura = "250px",
}) => {
  const cor = erro ? "erro" : "padrao";

  return (
    <div className="campo-formulario_root" style={{ width: largura }}>
      {rotulo && (
        <Rotulo texto={rotulo} para={id} cor={cor} obrigatorio={obrigatorio} />
      )}

      <InputTexto
        valor={valor}
        tipo={tipo}
        placeholder={placeholder}
        cor={cor}
        aoAlterar={aoAlterar}
        aoBlur={aoBlur}
        largura="100%"
      />

      {erro && <span className="campo-formulario_erro">{erro}</span>}
    </div>
  );
};

export default CampoFormulario;
