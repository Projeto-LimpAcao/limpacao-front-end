import { useRef } from "react";
import { LoaderCircle, Search } from "lucide-react";

import "./FormularioReporte.css";
import Input from "../../atomos/InputTexto/Inputexto";
import Select from "../../atomos/Selecao/Selecao";
import Textarea from "../../atomos/Textarea/Textarea";
import Botao from "../../atomos/Botao/Botao";
import CampoImagens from "../../moleculas/CampoImagens/CampoImagens";
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
  onBuscarCep,
  buscandoCep = false,
  erroCep = "",
}) {
  const campoNumero = useRef(null);

  const alterarCep = (evento) => {
    const digitos = evento.target.value.replace(/\D/g, "").slice(0, 8);
    const cep = digitos.replace(/^(\d{5})(\d)/, "$1-$2");
    onAlterar("cep", cep);
  };

  const buscarEndereco = async () => {
    const encontrado = await onBuscarCep(formulario.cep);
    if (encontrado) campoNumero.current?.focus();
  };

  return (
    <div className="form-reporte">
      <Alerta tipo="erro">{erroGeral}</Alerta>

      <div className="form-reporte__linha">
        <Input
          label="Título"
          obrigatorio
          placeholder="Ex: Descarte irregular em área pública"
          value={formulario.titulo}
          onChange={(evento) => onAlterar("titulo", evento.target.value)}
          erro={Boolean(erros.titulo)}
          mensagemErro={erros.titulo}
        />
      </div>

      <fieldset className="form-reporte__endereco">
        <legend className="form-reporte__endereco-titulo">Endereço do local</legend>
        <p className="form-reporte__endereco-ajuda">
          Informe o CEP para preencher rua, cidade e estado automaticamente.
        </p>

        <div className="form-reporte__cep">
          <Input
            label="CEP"
            name="cep"
            obrigatorio
            placeholder="00000-000"
            value={formulario.cep}
            onChange={alterarCep}
            erro={Boolean(erroCep || erros.cep)}
            mensagemErro={erroCep || erros.cep}
          />
          <Botao
            variante="secundario"
            icone={
              buscandoCep ? (
                <LoaderCircle size={16} className="form-reporte__spinner" />
              ) : (
                <Search size={16} />
              )
            }
            onClick={() => void buscarEndereco()}
            desabilitado={
              buscandoCep || formulario.cep.replace(/\D/g, "").length !== 8
            }
            ariaLabel={buscandoCep ? "Buscando CEP" : "Buscar endereço pelo CEP"}
          >
            {buscandoCep ? "Buscando..." : "Buscar CEP"}
          </Botao>
        </div>

        <div className="form-reporte__linha">
          <Input
            label="Rua"
            obrigatorio
            placeholder="Preenchida pela busca do CEP"
            value={formulario.rua}
            onChange={(evento) => onAlterar("rua", evento.target.value)}
            erro={Boolean(erros.rua)}
            mensagemErro={erros.rua}
          />
          <Input
            label="Número"
            obrigatorio
            placeholder="Ex: 123 ou S/N"
            value={formulario.numero}
            onChange={(evento) => onAlterar("numero", evento.target.value)}
            inputRef={campoNumero}
            erro={Boolean(erros.numero)}
            mensagemErro={erros.numero}
          />
        </div>

        <div className="form-reporte__linha">
          <Input
            label="Cidade"
            obrigatorio
            placeholder="Preenchida pela busca do CEP"
            value={formulario.cidade}
            onChange={(evento) => onAlterar("cidade", evento.target.value)}
            erro={Boolean(erros.cidade)}
            mensagemErro={erros.cidade}
          />
          <Input
            label="Estado"
            obrigatorio
            placeholder="UF"
            value={formulario.estado}
            onChange={(evento) => onAlterar("estado", evento.target.value)}
            erro={Boolean(erros.estado)}
            mensagemErro={erros.estado}
          />
        </div>

        <Input
          label="Bairro ou ponto de referência"
          obrigatorio
          placeholder="Ex: Bairro, parque, praça ou ponto de referência"
          value={formulario.localizacao}
          onChange={(evento) => onAlterar("localizacao", evento.target.value)}
          erro={Boolean(erros.localizacao)}
          mensagemErro={erros.localizacao}
        />
      </fieldset>

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
          placeholder="Selecione..."
          obrigatorio
          erro={Boolean(erros.urgencia)}
          mensagemErro={erros.urgencia}
        />

        <div>
          <RadioGrupo
            label="Organizar um mutirão?"
            valor={formulario.multirao}
            onChange={(valor) => onAlterar("multirao", valor)}
            obrigatorio
            opcoes={[
              { valor: true, label: "Sim" },
              { valor: false, label: "Não" },
            ]}
          />
          {erros.multirao && (
            <span className="select-mensagem-erro" role="alert">
              {erros.multirao}
            </span>
          )}
        </div>
      </div>

      <CampoImagens
        obrigatorio
        imagens={formulario.imagens ?? []}
        onArquivoSelecionado={onArquivoSelecionado}
        onRemoverImagem={onRemoverImagem}
        erro={erros.imagens}
      />
    </div>
  );
}
