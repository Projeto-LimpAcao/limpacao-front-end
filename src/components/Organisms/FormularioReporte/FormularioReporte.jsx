import { ImagePlus, Trash2 } from "lucide-react";

import "./FormularioReporte.css";
import Input from "../../atomos/InputTexto/Inputexto";
import Select from "../../atomos/Selecao/Selecao";
import Textarea from "../../atomos/Textarea/Textarea";
import Botao from "../../atomos/Botao/Botao";
import RadioGrupo from "../../moleculas/RadioGrupo/RadioGrupo";
import Alerta from "../../moleculas/Alerta/Alerta";
import { URGENCIAS } from "../../../config/listas";

export default function FormularioReporte({
  formulario,
  onAlterar,
  erros = {},
  erroGeral = "",
  onArquivoSelecionado,
  onRemoverImagem,
}) {
  return (
    <div className="form-reporte">
      <Alerta tipo="erro">{erroGeral}</Alerta>

      <div className="form-reporte__linha">
        <Input
          label="Título"
          obrigatorio
          placeholder="Ex: Lixo na Praia da Armação"
          value={formulario.titulo}
          onChange={(evento) => onAlterar("titulo", evento.target.value)}
          erro={Boolean(erros.titulo)}
          mensagemErro={erros.titulo}
        />

        <Input
          label="Localização"
          obrigatorio
          placeholder="Ex: Praia da Armação, Florianópolis"
          value={formulario.localizacao}
          onChange={(evento) => onAlterar("localizacao", evento.target.value)}
          erro={Boolean(erros.localizacao)}
          mensagemErro={erros.localizacao}
        />
      </div>

      <Textarea
        label="Descrição"
        obrigatorio
        linhas={4}
        placeholder="Descreva o problema: o que tem no local, desde quando, o que ajudaria..."
        value={formulario.descricao}
        onChange={(evento) => onAlterar("descricao", evento.target.value)}
        erro={Boolean(erros.descricao)}
        mensagemErro={erros.descricao}
      />

      <div className="form-reporte__linha">
        <Select
          label="Urgência"
          value={formulario.urgencia}
          onChange={(evento) => onAlterar("urgencia", evento.target.value)}
          opcoes={URGENCIAS}
          placeholder=""
        />

        <RadioGrupo
          label="Organizar um mutirão?"
          valor={formulario.multirao}
          onChange={(valor) => onAlterar("multirao", valor)}
          opcoes={[
            { valor: true, label: "Sim" },
            { valor: false, label: "Não" },
          ]}
        />
      </div>

      {/* ---- Foto ---- */}
      <div className="form-reporte__foto">
        <span className="form-reporte__foto-label">Foto (opcional)</span>

        <div className="form-reporte__foto-area">
          <input
            type="file"
            accept="image/*"
            onChange={onArquivoSelecionado}
            className="form-reporte__arquivo"
          />

          <Botao variante="secundario" icone={<ImagePlus size={16} />}>
            {formulario.imagem ? "Trocar foto" : "Escolher foto"}
          </Botao>

          {formulario.imagem ? (
            <div className="form-reporte__previa">
              <img src={formulario.imagem} alt="Prévia da foto escolhida" />

              <button
                type="button"
                className="form-reporte__remover"
                onClick={onRemoverImagem}
                aria-label="Remover foto"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ) : (
            <p className="form-reporte__dica">
              Uma foto ajuda muito quem for resolver o problema.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
