import { BarChart3, CheckCircle2, Clock, FileText } from "lucide-react";

import "./PainelEstatisticas.css";
import StatCard from "../../moleculas/StatCard/StatCard";

export default function PainelEstatisticas({
  estatisticas = {
    total: 0,
    resolvidos: 0,
    emAndamento: 0,
    meus: 0,
    taxaResolucao: 0,
    taxaResolucaoGeral: 0,
    taxaIndividual: false,
  },
  filtroAtivo = "todos",
  meusAtivo = false,
  onFiltrar,
  onVerMeus,
}) {
  const {
    total,
    resolvidos,
    emAndamento,
    meus,
    taxaResolucao,
    taxaResolucaoGeral,
    taxaIndividual,
  } = estatisticas;
  const taxas = taxaIndividual
    ? [
        {
          chave: "individual",
          rotulo: "Sua taxa de resolução",
          valor: taxaResolucao,
        },
        {
          chave: "geral",
          rotulo: "Taxa geral da comunidade",
          valor: taxaResolucaoGeral,
        },
      ]
    : [
        {
          chave: "geral",
          rotulo: "Taxa de resolução da comunidade",
          valor: taxaResolucaoGeral,
        },
      ];

  return (
    <section className="painel-stats">
      <div className="painel-stats__interno">
        <div className="painel-stats__cabecalho">
          <div className="painel-stats__titulos">
            <p className="painel-stats__etiqueta">Painel de acompanhamento</p>
            <h1 className="painel-stats__titulo">Visão geral dos reportes</h1>
            <p className="painel-stats__descricao">
              Acompanhe o volume de reportes, o progresso das ações e os casos
              resolvidos nas comunidades.
            </p>
          </div>

          <div className="painel-stats__taxas">
            {taxas.map(({ chave, rotulo, valor }) => (
              <div className="painel-stats__taxa" key={chave}>
                <p className="painel-stats__taxa-label">{rotulo}</p>
                <p className="painel-stats__taxa-valor">{valor}%</p>

                <div
                  className="painel-stats__barra"
                  role="progressbar"
                  aria-label={rotulo}
                  aria-valuenow={valor}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <span style={{ width: `${valor}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="painel-stats__cartoes">
          <StatCard
            icone={<BarChart3 size={28} />}
            valor={total}
            label="Reportes cadastrados"
            ativo={filtroAtivo === "todos"}
            onClick={onFiltrar ? () => onFiltrar("todos") : undefined}
          />

          <StatCard
            icone={<CheckCircle2 size={28} />}
            valor={resolvidos}
            label="Problemas resolvidos"
            ativo={filtroAtivo === "resolved"}
            onClick={onFiltrar ? () => onFiltrar("resolved") : undefined}
          />

          <StatCard
            icone={<Clock size={28} />}
            valor={emAndamento}
            label="Em andamento"
            ativo={filtroAtivo === "in-progress"}
            onClick={onFiltrar ? () => onFiltrar("in-progress") : undefined}
          />

          <StatCard
            icone={<FileText size={28} />}
            valor={meus}
            label="Meus reportes"
            ativo={meusAtivo}
            onClick={onVerMeus}
          />
        </div>
      </div>
    </section>
  );
}
