import {
  MapPin,
  Pencil,
  Trash2,
  MessageSquare,
  HandHeart,
  Users,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";

import "./CardReporte.css";
import Badge from "../../atomos/Badge/Badge";
import Select from "../../atomos/Selecao/Selecao";
import Modal from "../../moleculas/Modal/Modal";
import { STATUS, urgencia as infoUrgencia, status as infoStatus } from "../../../config/listas";
import { formatarData } from "../../../utils/formatar";

const ICONE_STATUS = {
  pending: AlertCircle,
  "in-progress": Clock,
  resolved: CheckCircle2,
};

export default function CardReporte({
  reporte = {},
  onEditar,
  onExcluir,
  onAbrirChat,
  onAjudar,
  onParticipar,
  onMudarStatus,
  imagemAberta = false,
  onAbrirImagem,
  onFecharImagem,
}) {
  const urg = infoUrgencia(reporte.urgencia);
  const st = infoStatus(reporte.status);
  const IconeStatus = ICONE_STATUS[reporte.status];

  const estouAjudando = reporte.minhaParticipacao?.ajudando;
  const estouParticipando = reporte.minhaParticipacao?.participando;

  return (
    <>
      <article className={`card-reporte card-reporte--${reporte.urgencia}`}>
        {reporte.imagem && (
          <button
            type="button"
            className="card-reporte__foto"
            onClick={onAbrirImagem}
            aria-label={`Ver foto de ${reporte.titulo}`}
          >
            <img src={reporte.imagem} alt={reporte.titulo} />
          </button>
        )}

        <div className="card-reporte__corpo">
          <div className="card-reporte__etiquetas">
            <Badge cor={urg.cor}>{urg.label}</Badge>
            <Badge cor={st.cor} icone={IconeStatus && <IconeStatus size={13} />}>
              {st.label}
            </Badge>
          </div>

          {reporte.multirao && (
            <Badge cor="primario" icone={<Users size={13} />}>
              Mutirão confirmado
            </Badge>
          )}

          <h3 className="card-reporte__titulo linhas-2">{reporte.titulo}</h3>

          <p className="card-reporte__local">
            <MapPin size={15} />
            <span className="linhas-1">{reporte.localizacao}</span>
          </p>

          <p className="card-reporte__descricao linhas-2">{reporte.descricao}</p>

          <div className="card-reporte__rodape">
            <div className="card-reporte__autor">
              <strong>{reporte.autor}</strong>
              <span>{formatarData(reporte.data)}</span>
            </div>

            <div className="card-reporte__contadores">
              {reporte.multirao && (
                <span className="card-reporte__contador">
                  {reporte.participantes} participando
                </span>
              )}
              <span className="card-reporte__contador">
                {reporte.ajudantes} ajudando
              </span>
              <span className="card-reporte__contador">
                {reporte.mensagens?.length ?? 0} mensagens
              </span>
            </div>
          </div>

          <div className="card-reporte__acoes">
            <button
              type="button"
              className="card-reporte__acao"
              onClick={onAbrirChat}
            >
              <MessageSquare size={15} />
              Ver mensagens
            </button>

            {!reporte.souDono && (
              <>
                <button
                  type="button"
                  className={`card-reporte__acao ${
                    estouAjudando ? "card-reporte__acao--ativa" : ""
                  }`}
                  onClick={onAjudar}
                >
                  <HandHeart size={15} />
                  {estouAjudando ? "Ajudando" : "Quero ajudar"}
                </button>

                {reporte.multirao && (
                  <button
                    type="button"
                    className={`card-reporte__acao ${
                      estouParticipando ? "card-reporte__acao--ativa" : ""
                    }`}
                    onClick={onParticipar}
                  >
                    <Users size={15} />
                    {estouParticipando ? "Participando" : "Quero participar"}
                  </button>
                )}
              </>
            )}
          </div>

          {reporte.souDono && (
            <div className="card-reporte__dono">
              <div className="card-reporte__dono-botoes">
                <button
                  type="button"
                  className="card-reporte__icone"
                  onClick={onEditar}
                  aria-label="Editar reporte"
                  title="Editar"
                >
                  <Pencil size={16} />
                </button>

                <button
                  type="button"
                  className="card-reporte__icone card-reporte__icone--perigo"
                  onClick={onExcluir}
                  aria-label="Excluir reporte"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <Select
                tamanho="pequeno"
                value={reporte.status}
                onChange={(evento) => onMudarStatus?.(evento.target.value)}
                opcoes={STATUS}
                placeholder=""
              />
            </div>
          )}
        </div>
      </article>

      <Modal
        aberto={imagemAberta}
        onFechar={onFecharImagem}
        titulo={reporte.titulo}
        largura="760px"
      >
        <img
          src={reporte.imagem}
          alt={reporte.titulo}
          className="card-reporte__foto-grande"
        />
      </Modal>
    </>
  );
}
