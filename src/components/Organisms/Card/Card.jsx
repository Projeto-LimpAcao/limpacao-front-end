import "./Card.css";
import Avatar from "../../atomos/Avatar/Avatar";
import Botao from "../../atomos/Botao/Botao";

export default function Card({
  titulo = "Título do card",
  subtitulo = "",
  descricao = "",
  detalhes = "",
  imagem = "",
  avatarNome = "",
  avatarSrc = "",
  acaoLabel = "",
  expandido = false,
  onAcaoClick,
  onToggleDetalhes,
}) {
  const temTopo = Boolean(avatarNome || avatarSrc || titulo || subtitulo);

  return (
    <article className="card">
      {temTopo && (
        <div className="card__topo">
          {(avatarNome || avatarSrc) && (
            <Avatar nome={avatarNome || titulo} src={avatarSrc} />
          )}

          <div className="card__titulos">
            <h3 className="card__titulo">{titulo}</h3>
            {subtitulo && <p className="card__subtitulo">{subtitulo}</p>}
          </div>
        </div>
      )}

      {imagem && <img className="card__imagem" src={imagem} alt={titulo} />}

      {descricao && <p className="card__descricao">{descricao}</p>}

      {expandido && detalhes && <p className="card__detalhes">{detalhes}</p>}

      {(acaoLabel || detalhes) && (
        <div className="card__acoes">
          {acaoLabel && (
            <Botao tamanho="pequeno" onClick={onAcaoClick}>
              {acaoLabel}
            </Botao>
          )}

          {detalhes && (
            <Botao
              variante="texto"
              tamanho="pequeno"
              onClick={onToggleDetalhes}
            >
              {expandido ? "Ocultar" : "Mais detalhes"}
            </Botao>
          )}
        </div>
      )}
    </article>
  );
}
