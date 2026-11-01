import Modal from "../../moleculas/Modal/Modal";
import Input from "../../atomos/InputTexto/Inputexto";
import Textarea from "../../atomos/Textarea/Textarea";
import Alerta from "../../moleculas/Alerta/Alerta";

export default function ModalAjuda({
  reporte = null,
  onFechar,
  onEnviar,
  formulario = { nome: "", telefone: "", mensagem: "" },
  erros = {},
  erroGeral = "",
  enviando = false,
  onAlterarCampo,
  onLimparErroGeral,
}) {
  if (!reporte) return null;

  const enviar = () => {
    if (onEnviar) {
      onEnviar(reporte.id, formulario);
    }
  };

  return (
    <Modal
      aberto
      onFechar={onFechar}
      titulo={`Quero ajudar: ${reporte.titulo}`}
      onConfirmar={enviar}
      rotuloConfirmar="Enviar oferta"
      confirmando={enviando}
    >
      <Alerta tipo="erro" onFechar={onLimparErroGeral}>
        {erroGeral}
      </Alerta>

      <p className="texto-apoio">
        Seus dados vão aparecer só para quem criou o reporte, para combinarem
        os detalhes.
      </p>

      <Input
        label="Nome"
        obrigatorio
        placeholder="Seu nome"
        value={formulario.nome}
        onChange={onAlterarCampo ? onAlterarCampo("nome") : undefined}
        erro={Boolean(erros.nome)}
        mensagemErro={erros.nome}
      />

      <Input
        label="Telefone"
        type="tel"
        obrigatorio
        placeholder="(48) 99999-9999"
        value={formulario.telefone}
        onChange={onAlterarCampo ? onAlterarCampo("telefone") : undefined}
        erro={Boolean(erros.telefone)}
        mensagemErro={erros.telefone}
      />

      <Textarea
        label="Como você pode ajudar"
        linhas={3}
        placeholder="Ex: tenho carro pra transportar o material, posso no sábado de manhã..."
        value={formulario.mensagem}
        onChange={onAlterarCampo ? onAlterarCampo("mensagem") : undefined}
      />
    </Modal>
  );
}
