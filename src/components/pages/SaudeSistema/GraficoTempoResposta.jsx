import { useEffect, useRef, useState } from "react";

import { infoStatus } from "../../../utils/saude";

const ALTURA = 260;
const MARGEM = { topo: 8, direita: 56, base: 30, esquerda: 60 };
const FAIXA_SEM_RESPOSTA = 36;
const ESPACO_FAIXA = 14;
const MAX_ROTULOS_X = 6;
const LARGURA_ROTULO_X = 110;

const LEGENDA = [
  { classe: "up", rotulo: "Funcionando" },
  { classe: "degraded", rotulo: "Com problemas" },
  { classe: "down", rotulo: "Fora do ar" },
];

function topoDoEixo(maximo) {
  const passos = [20, 40, 60, 80, 100, 200, 400, 600, 800, 1000, 2000, 4000, 6000, 8000, 10000];
  const alvo = maximo * 1.15;
  return passos.find((passo) => passo >= alvo) ?? Math.ceil(alvo / 4000) * 4000;
}

function formatarHora(data) {
  return data.toLocaleTimeString("pt-BR");
}

function formatarMs(valor) {
  return valor.toLocaleString("pt-BR");
}

function indicesDoEixoX(total, larguraArea) {
  if (total <= 1) return total === 1 ? [0] : [];
  const cabem = Math.max(2, Math.floor(larguraArea / LARGURA_ROTULO_X));
  const quantidade = Math.min(MAX_ROTULOS_X, cabem, total);
  const passo = Math.ceil((total - 1) / (quantidade - 1));
  const indices = [];
  for (let i = 0; i < total - 1; i += passo) indices.push(i);
  if (indices.length > 1 && total - 1 - indices.at(-1) < passo / 2) indices.pop();
  indices.push(total - 1);
  return indices;
}

function useLargura() {
  const ref = useRef(null);
  const [largura, setLargura] = useState(0);

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento) return undefined;

    const atualizar = (medida) => {
      const nova = Math.round(medida);
      if (nova > 0) setLargura(Math.max(280, nova));
    };

    atualizar(elemento.getBoundingClientRect().width);
    const observador = new ResizeObserver(([entrada]) => atualizar(entrada.contentRect.width));
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  return [ref, largura];
}

function Estatistica({ rotulo, valor, destaque = false }) {
  return (
    <div className={`grafico__estatistica ${destaque ? "grafico__estatistica--destaque" : ""}`}>
      <span>{rotulo}</span>
      <strong>{valor}</strong>
    </div>
  );
}

export default function GraficoTempoResposta({ verificacoes }) {
  const [ref, largura] = useLargura();
  const [ativo, setAtivo] = useState(null);
  const [verTabela, setVerTabela] = useState(false);

  const total = verificacoes.length;
  const tempos = verificacoes.map((v) => v.tempoMs).filter((t) => t != null);
  const ultimo = verificacoes.at(-1);
  const falhas = verificacoes.filter((v) => infoStatus(v.status).classe === "down").length;
  const media = tempos.length
    ? Math.round(tempos.reduce((soma, t) => soma + t, 0) / tempos.length)
    : null;
  const pico = tempos.length ? Math.max(...tempos) : null;

  const areaX = largura - MARGEM.esquerda - MARGEM.direita;
  const topoValores = MARGEM.topo + FAIXA_SEM_RESPOSTA + ESPACO_FAIXA;
  const baseY = ALTURA - MARGEM.base;
  const alturaValores = baseY - topoValores;
  const topo = topoDoEixo(Math.max(...tempos, 1));
  const passoX = total > 1 ? areaX / (total - 1) : 0;

  const x = (indice) => MARGEM.esquerda + (total > 1 ? indice * passoX : areaX / 2);
  const yValor = (ms) => baseY - (ms / topo) * alturaValores;
  const ySemResposta = MARGEM.topo + FAIXA_SEM_RESPOSTA - 10;

  const pontos = verificacoes.map((v, indice) => ({
    x: x(indice),
    y: v.tempoMs == null ? ySemResposta : yValor(v.tempoMs),
    semResposta: v.tempoMs == null,
    classe: infoStatus(v.status).classe,
    verificacao: v,
  }));

  const comMarcador = pontos.filter(
    (ponto, i) =>
      i === total - 1 || ponto.semResposta || (i > 0 && pontos[i - 1].classe !== ponto.classe),
  );

  const linhasGrade = [0, 0.25, 0.5, 0.75, 1].map((fracao) => Math.round(topo * fracao));
  const rotulosX = indicesDoEixoX(total, areaX);
  const ultimoPonto = pontos.at(-1);

  const indiceNoPonteiro = (evento) => {
    const caixa = evento.currentTarget.getBoundingClientRect();
    const posicao = evento.clientX - caixa.left - MARGEM.esquerda;
    if (total <= 1) return 0;
    return Math.min(total - 1, Math.max(0, Math.round(posicao / passoX)));
  };

  const aoTeclar = (evento) => {
    if (!total) return;
    if (evento.key === "ArrowLeft") {
      setAtivo((i) => Math.max(0, (i ?? total) - 1));
    } else if (evento.key === "ArrowRight") {
      setAtivo((i) => Math.min(total - 1, (i ?? -1) + 1));
    } else if (evento.key === "Escape") {
      setAtivo(null);
    }
  };

  const pontoAtivo = ativo != null ? pontos[ativo] : null;
  const dicaADireita = pontoAtivo && pontoAtivo.x < largura / 2;

  return (
    <div ref={ref} className="grafico">
      <div className="grafico__resumo">
        <Estatistica
          rotulo="Atual"
          valor={ultimo?.tempoMs != null ? `${formatarMs(ultimo.tempoMs)} ms` : "Sem resposta"}
          destaque
        />
        <Estatistica rotulo="Média" valor={media != null ? `${formatarMs(media)} ms` : "—"} />
        <Estatistica rotulo="Pico" valor={pico != null ? `${formatarMs(pico)} ms` : "—"} />
        <Estatistica rotulo="Falhas" valor={`${falhas} de ${total}`} />
      </div>

      <div className="grafico__barra">
        <ul className="grafico__legenda" aria-label="Legenda">
          {LEGENDA.map(({ classe, rotulo }) => (
            <li key={classe}>
              <span className={`grafico__chave grafico__cor--${classe}`} aria-hidden="true" />
              {rotulo}
            </li>
          ))}
        </ul>

        <div className="grafico__alternancia" role="group" aria-label="Forma de exibição">
          <button
            type="button"
            aria-pressed={!verTabela}
            className={!verTabela ? "ativo" : ""}
            onClick={() => setVerTabela(false)}
          >
            Gráfico
          </button>
          <button
            type="button"
            aria-pressed={verTabela}
            className={verTabela ? "ativo" : ""}
            onClick={() => setVerTabela(true)}
          >
            Tabela
          </button>
        </div>
      </div>

      {verTabela && (
        <div className="grafico__tabela">
          <table>
            <thead>
              <tr>
                <th>Hora</th>
                <th>Status</th>
                <th className="numero">Tempo de resposta</th>
              </tr>
            </thead>
            <tbody>
              {[...verificacoes].reverse().map((v) => {
                const { classe, rotulo } = infoStatus(v.status);
                return (
                  <tr key={v.hora.getTime()}>
                    <td>{formatarHora(v.hora)}</td>
                    <td>
                      <span className={`grafico__chave grafico__cor--${classe}`} aria-hidden="true" />
                      {rotulo}
                    </td>
                    <td className="numero">{v.tempoMs != null ? `${formatarMs(v.tempoMs)} ms` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div
          hidden={verTabela}
          className="grafico__area"
          tabIndex={0}
          role="img"
          aria-label={`Tempo de resposta das últimas ${total} verificações. Use as setas para navegar.`}
          onPointerMove={(evento) => setAtivo(indiceNoPonteiro(evento))}
          onPointerLeave={() => setAtivo(null)}
          onKeyDown={aoTeclar}
          onBlur={() => setAtivo(null)}
        >
          {largura > 0 && (
          <svg width={largura} height={ALTURA} aria-hidden="true">
            <rect
              className="grafico__faixa-sem-resposta"
              x={MARGEM.esquerda}
              y={MARGEM.topo}
              width={areaX}
              height={FAIXA_SEM_RESPOSTA}
              rx={4}
            />
            <text
              className="grafico__rotulo-faixa"
              x={MARGEM.esquerda + 8}
              y={MARGEM.topo + 13}
            >
              SEM RESPOSTA
            </text>

            {linhasGrade.map((valor) => (
              <g key={valor}>
                <line
                  className={valor === 0 ? "grafico__base" : "grafico__grade"}
                  x1={MARGEM.esquerda}
                  x2={MARGEM.esquerda + areaX}
                  y1={yValor(valor)}
                  y2={yValor(valor)}
                />
                {valor > 0 && (
                  <text
                    className="grafico__eixo"
                    x={MARGEM.esquerda - 8}
                    y={yValor(valor) + 4}
                    textAnchor="end"
                  >
                    {valor === topo ? `${formatarMs(valor)} ms` : formatarMs(valor)}
                  </text>
                )}
              </g>
            ))}

            {rotulosX.map((indice, posicao) => (
              <g key={`x-${indice}`}>
                <line
                  className="grafico__base"
                  x1={x(indice)}
                  x2={x(indice)}
                  y1={baseY}
                  y2={baseY + 4}
                />
                <text
                  className="grafico__eixo"
                  x={x(indice)}
                  y={ALTURA - 8}
                  textAnchor={
                    posicao === 0 ? "start" : posicao === rotulosX.length - 1 ? "end" : "middle"
                  }
                >
                  {formatarHora(verificacoes[indice].hora)}
                </text>
              </g>
            ))}

            {pontos.slice(1).map((ponto, i) => {
              const anterior = pontos[i];
              if (ponto.semResposta || anterior.semResposta) return null;
              return (
                <polygon
                  key={`a-${ponto.verificacao.hora.getTime()}`}
                  className={`grafico__area-preenchida grafico__cor--${ponto.classe}`}
                  points={`${anterior.x},${anterior.y} ${ponto.x},${ponto.y} ${ponto.x},${baseY} ${anterior.x},${baseY}`}
                />
              );
            })}

            {pontos.slice(1).map((ponto, i) => (
              <line
                key={`l-${ponto.verificacao.hora.getTime()}`}
                className={`grafico__linha grafico__cor--${ponto.classe}`}
                x1={pontos[i].x}
                y1={pontos[i].y}
                x2={ponto.x}
                y2={ponto.y}
              />
            ))}

            {comMarcador.map((ponto) => (
              <circle
                key={`p-${ponto.verificacao.hora.getTime()}`}
                className={`grafico__ponto grafico__cor--${ponto.classe}`}
                cx={ponto.x}
                cy={ponto.y}
                r={4}
              />
            ))}

            {ultimoPonto && !ultimoPonto.semResposta && (
              <text
                className="grafico__valor-final"
                x={ultimoPonto.x + 8}
                y={ultimoPonto.y + 4}
              >
                {formatarMs(ultimoPonto.verificacao.tempoMs)} ms
              </text>
            )}

            {pontoAtivo && (
              <g>
                <line
                  className="grafico__mira"
                  x1={pontoAtivo.x}
                  x2={pontoAtivo.x}
                  y1={MARGEM.topo}
                  y2={baseY}
                />
                <circle
                  className={`grafico__ponto grafico__cor--${pontoAtivo.classe}`}
                  cx={pontoAtivo.x}
                  cy={pontoAtivo.y}
                  r={6}
                />
              </g>
            )}
          </svg>
          )}

          {pontoAtivo && (
            <div
              className={`grafico__dica ${dicaADireita ? "grafico__dica--direita" : "grafico__dica--esquerda"}`}
              style={{ left: pontoAtivo.x, top: Math.max(0, pontoAtivo.y - 28) }}
            >
              <span className="grafico__dica-hora">{formatarHora(pontoAtivo.verificacao.hora)}</span>
              <strong>
                {pontoAtivo.semResposta ? "Sem resposta" : `${formatarMs(pontoAtivo.verificacao.tempoMs)} ms`}
              </strong>
              <span className="grafico__dica-status">
                <span
                  className={`grafico__chave grafico__cor--${pontoAtivo.classe}`}
                  aria-hidden="true"
                />
                {infoStatus(pontoAtivo.verificacao.status).rotulo}
              </span>
            </div>
          )}
        </div>
    </div>
  );
}
