import { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Pencil,
  Trash2,
  MessageSquare,
  MessageCircle,
  HandHeart,
  Users,
  Bell,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
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
  onVerOfertas,
  onConversarOferta,
  onVerMensagensNaoLidas,
  estaLogado = false,
}) {
  const [imagemAberta, setImagemAberta] = useState(false);
  const [indiceImagem, setIndiceImagem] = useState(0);
  const [indiceCapa, setIndiceCapa] = useState(0);
  const pausarCarrosselRef = useRef(false);
  const imagens = reporte.imagens?.length
    ? reporte.imagens
    : reporte.imagem
      ? [reporte.imagem]
      : [];

  useEffect(() => {
    if (imagens.length < 2) return undefined;

    const temporizador = window.setInterval(() => {
      if (imagemAberta || pausarCarrosselRef.current) return;
      setIndiceCapa((indice) => (indice + 1) % imagens.length);
    }, 6000);

    return () => window.clearInterval(temporizador);
  }, [imagemAberta, imagens.length]);

  const urg = infoUrgencia(reporte.urgencia);
  const st = infoStatus(reporte.status);
  const IconeStatus = ICONE_STATUS[reporte.status];

  const estouAjudando = reporte.minhaParticipacao?.ajudando;
  const estouParticipando = reporte.minhaParticipacao?.participando;
  const souDono = estaLogado && reporte.souDono;

  return (
    <>
      <article className={`card-reporte card-reporte--${reporte.urgencia}`}>
        {imagens.length > 0 && (
          <button
            type="button"
            className="card-reporte__foto"
            onClick={() => {
              setIndiceImagem(indiceCapa);
              setImagemAberta(true);
            }}
            onMouseEnter={() => {
              pausarCarrosselRef.current = true;
            }}
            onMouseLeave={() => {
              pausarCarrosselRef.current = false;
            }}
            aria-label={`Ver ${imagens.length === 1 ? "imagem" : `${imagens.length} imagens`} de ${reporte.titulo}`}
          >
            <img
              src={imagens[indiceCapa]}
              alt={`${reporte.titulo} — imagem ${indiceCapa + 1} de ${imagens.length}`}
            />
            {imagens.length > 1 && (
              <span className="card-reporte__foto-contagem">
                {indiceCapa + 1} / {imagens.length} fotos
              </span>
            )}
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
              {souDono && (
                <span className="card-reporte__contador">
                  {reporte.ofertas?.length ?? 0} ofertas de ajuda
                </span>
              )}
              <span className="card-reporte__contador">
                {reporte.quantidadeMensagens ?? reporte.mensagens?.length ?? 0} mensagens
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
              Mensagens da comunidade
            </button>

            {!souDono && (
              <>
                <button
                  type="button"
                  className={`card-reporte__acao ${
                    estouAjudando ? "card-reporte__acao--ativa" : ""
                  }`}
                  onClick={estouAjudando ? onConversarOferta : onAjudar}
                >
                  {estouAjudando ? (
                    <MessageCircle size={15} />
                  ) : (
                    <HandHeart size={15} />
                  )}
                  {estouAjudando ? "Mensagens privadas" : "Quero ajudar"}
                  {estouAjudando && reporte.mensagensNaoLidasMinhaOferta > 0 && (
                    <span className="card-reporte__mensagens-contagem">
                      {reporte.mensagensNaoLidasMinhaOferta}
                    </span>
                  )}
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

          {souDono && (
            <div className="card-reporte__dono">
              <div className="card-reporte__dono-botoes">
                {onVerOfertas && (
                  <button
                    type="button"
                    className="card-reporte__icone card-reporte__notificacoes"
                    onClick={onVerOfertas}
                    aria-label={`Ver ${reporte.ofertas?.length ?? 0} ofertas de ajuda para ${reporte.titulo}`}
                    title="Ofertas de ajuda"
                  >
                    <Bell size={16} aria-hidden="true" />
                    {(reporte.ofertas?.length ?? 0) > 0 && (
                      <span className="card-reporte__notificacoes-contagem">
                        {reporte.ofertas.length}
                      </span>
                    )}
                  </button>
                )}
                {onVerMensagensNaoLidas && (
                  <button
                    type="button"
                    className="card-reporte__icone card-reporte__notificacoes"
                    onClick={onVerMensagensNaoLidas}
                    aria-label={
                      reporte.mensagensNaoLidas > 0
                        ? `Abrir mensagens privadas: ${reporte.mensagensNaoLidas} não lidas`
                        : "Abrir mensagens privadas"
                    }
                    title="Mensagens privadas"
                  >
                    <MessageCircle size={16} aria-hidden="true" />
                    {reporte.mensagensNaoLidas > 0 && (
                      <span className="card-reporte__notificacoes-contagem">
                        {reporte.mensagensNaoLidas}
                      </span>
                    )}
                  </button>
                )}
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
        onFechar={() => setImagemAberta(false)}
        titulo={reporte.titulo}
        largura="1400px"
        className="modal--imagem-reporte"
      >
        <div className="card-reporte__galeria">
          {imagens.length > 1 && (
            <button
              type="button"
              className="card-reporte__navegacao-imagem"
              onClick={() =>
                setIndiceImagem((indice) => (indice - 1 + imagens.length) % imagens.length)
              }
              aria-label="Imagem anterior"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <img
            src={imagens[indiceImagem]}
            alt={`${reporte.titulo} — imagem ${indiceImagem + 1} de ${imagens.length}`}
            className="card-reporte__foto-grande"
          />
          {imagens.length > 1 && (
            <>
              <button
                type="button"
                className="card-reporte__navegacao-imagem"
                onClick={() => setIndiceImagem((indice) => (indice + 1) % imagens.length)}
                aria-label="Próxima imagem"
              >
                <ChevronRight size={24} />
              </button>
              <span className="card-reporte__galeria-contagem">
                {indiceImagem + 1} / {imagens.length}
              </span>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
