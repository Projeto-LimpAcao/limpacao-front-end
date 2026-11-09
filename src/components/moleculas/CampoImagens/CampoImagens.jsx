import { useRef } from "react";
import { ImagePlus, Trash2 } from "lucide-react";

import "./CampoImagens.css";
import Botao from "../../atomos/Botao/Botao";
import { LIMITE_IMAGENS } from "../../utils/formatar";

/**
 * Campo para anexar imagens com prévia e botão de remover.
 * Usado no cadastro de reporte e na foto de conclusão da limpeza.
 */
export default function CampoImagens({
  label = "Foto",
  obrigatorio = false,
  imagens = [],
  onArquivoSelecionado,
  onRemoverImagem,
  dica = `Adicione pelo menos uma imagem (até ${LIMITE_IMAGENS} no total; JPEG, PNG, GIF ou WebP; até 5 MB cada).`,
  erro = "",
}) {
  const entradaArquivo = useRef(null);

  return (
    <div className="campo-imagens">
      <span className="campo-imagens__label">
        {label}
        {obrigatorio && " *"}
      </span>

      <div className="campo-imagens__area">
        <input
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          onChange={onArquivoSelecionado}
          className="campo-imagens__arquivo"
          ref={entradaArquivo}
        />

        <Botao
          variante="secundario"
          icone={<ImagePlus size={16} />}
          onClick={() => {
            entradaArquivo.current.value = "";
            entradaArquivo.current?.click();
          }}
          desabilitado={imagens.length >= LIMITE_IMAGENS}
        >
          Adicionar imagens ({imagens.length}/{LIMITE_IMAGENS})
        </Botao>

        {imagens.length > 0 ? (
          <div className="campo-imagens__previas">
            {imagens.map((imagem, indice) => (
              <div className="campo-imagens__previa" key={`${indice}-${imagem.slice(-24)}`}>
                <img src={imagem} alt={`Prévia da imagem ${indice + 1}`} />
                <button
                  type="button"
                  className="campo-imagens__remover"
                  onClick={() => onRemoverImagem(indice)}
                  aria-label={`Remover imagem ${indice + 1}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : null}
        <p className="campo-imagens__dica">{dica}</p>
        {erro && (
          <span className="select-mensagem-erro" role="alert">
            {erro}
          </span>
        )}
      </div>
    </div>
  );
}
