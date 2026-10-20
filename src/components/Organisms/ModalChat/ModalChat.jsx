import "./ModalChat.css";
import Modal from "../../moleculas/Modal/Modal";
import Textarea from "../../atomos/Textarea/Textarea";
import Alerta from "../../moleculas/Alerta/Alerta";
import { formatarDataHora } from "../../../utils/formatar";

export default function ModalChat({
  reporte = null,
  onFechar,
  onEnviar,
  texto = "",
  onTextoChange,
  erro = "",
  onErroFechar,
  enviando = false,
}) {
  if (!reporte) return null;

  const enviar = () => {
    if (onEnviar) {
      onEnviar(reporte.id, texto);
    }
  };

  return (
    <Modal
      aberto
      onFechar={onFechar}
      titulo={reporte.titulo}
      onConfirmar={enviar}
      rotuloConfirmar="Enviar mensagem"
      rotuloCancelar="Fechar"
      confirmando={enviando}
      largura="640px"
    >
      <div className="chat__resumo">
        {reporte.multirao && (
          <span className="chat__contador">{reporte.participantes} participando</span>
        )}
        <span className="chat__contador">{reporte.ajudantes} ajudando</span>
        <span className="chat__contador">{reporte.mensagens.length} mensagens</span>
      </div>

      <div className="chat__lista">
        {reporte.mensagens.length > 0 ? (
          reporte.mensagens.map((mensagem) => (
            <div key={mensagem.id} className="chat__mensagem">
              <div className="chat__mensagem-topo">
                <strong>{mensagem.autor}</strong>
                <span>{formatarDataHora(mensagem.data)}</span>
              </div>
              <p>{mensagem.texto}</p>
            </div>
          ))
        ) : (
          <p className="chat__vazio">
            Nenhuma mensagem ainda. Comece a conversa e chame gente pra ajudar.
          </p>
        )}
      </div>

      <Alerta tipo="erro" onFechar={onErroFechar}>
        {erro}
      </Alerta>

      <Textarea
        label="Nova mensagem"
        linhas={3}
        placeholder="Escreva sua mensagem..."
        value={texto}
        onChange={onTextoChange}
      />

      {reporte.souDono && (
        <div className="chat__ofertas">
          <h3 className="chat__ofertas-titulo">Ofertas de ajuda recebidas</h3>

          {reporte.ofertas.length > 0 ? (
            reporte.ofertas.map((oferta) => (
              <div key={oferta.id} className="chat__oferta">
                <strong>{oferta.nome}</strong>
                <a href={`tel:${oferta.telefone.replace(/\D/g, "")}`}>
                  {oferta.telefone}
                </a>
                {oferta.mensagem && <p>{oferta.mensagem}</p>}
                <span className="chat__oferta-data">
                  {formatarDataHora(oferta.data)}
                </span>
              </div>
            ))
          ) : (
            <p className="chat__vazio">Nenhuma oferta de ajuda ainda.</p>
          )}
        </div>
      )}
    </Modal>
  );
}
