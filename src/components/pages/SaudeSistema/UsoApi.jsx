import { useState } from "react";

const ACOES = {
  GET: { nome: "Consultar", exemplo: "abrir a lista de reportes" },
  POST: { nome: "Criar", exemplo: "criar um reporte, fazer login" },
  PUT: { nome: "Atualizar", exemplo: "editar um reporte ou o perfil" },
  DELETE: { nome: "Excluir", exemplo: "apagar um reporte" },
};

function formatarNumero(valor) {
  return valor.toLocaleString("pt-BR");
}

function porcentagem(parte, total) {
  if (!total) return "0%";
  const valor = (parte / total) * 100;
  return `${valor < 10 && valor > 0 ? valor.toFixed(1).replace(".", ",") : Math.round(valor)}%`;
}

function Numero({ titulo, valor, explicacao }) {
  return (
    <div className="uso-api__numero">
      <span className="uso-api__titulo">{titulo}</span>
      <strong>{valor}</strong>
      <span className="uso-api__explicacao">{explicacao}</span>
    </div>
  );
}

function SeloMetodo({ metodo }) {
  return (
    <span className={`uso-api__metodo uso-api__metodo--${metodo.toLowerCase()}`}>{metodo}</span>
  );
}

function PorTipoDeAcao({ metodos, total }) {
  return (
    <ul className="uso-api__acoes">
      {metodos.map(({ metodo, total: quantidade, erros }) => (
        <li key={metodo} className={`uso-api__acao ${quantidade === 0 ? "uso-api__acao--vazia" : ""}`}>
          <div className="uso-api__acao-topo">
            <SeloMetodo metodo={metodo} />
            <span className="uso-api__acao-nome">{ACOES[metodo]?.nome ?? metodo}</span>
          </div>
          <strong>{formatarNumero(quantidade)}</strong>
          <span className="uso-api__explicacao">
            {porcentagem(quantidade, total)} do total
            {erros > 0 && <span className="uso-api__com-erro"> · {formatarNumero(erros)} com erro</span>}
          </span>
          {ACOES[metodo] && <span className="uso-api__exemplo">Ex.: {ACOES[metodo].exemplo}</span>}
        </li>
      ))}
    </ul>
  );
}

export default function UsoApi({ metricas, porMinuto, indisponivel }) {
  const [filtro, setFiltro] = useState("TODOS");

  if (!metricas) {
    return (
      <p className="saude__sem-detalhes">
        {indisponivel
          ? "Não foi possível ler as requisições: o servidor não respondeu."
          : "Carregando as requisições..."}
      </p>
    );
  }

  const { total, tempoMedioMs, rotas } = metricas;
  const metodos = (metricas.metodos ?? []).filter(({ metodo }) => ACOES[metodo]);
  const rotasVisiveis = filtro === "TODOS" ? rotas : rotas.filter((r) => r.metodo === filtro);
  const maiorRota = Math.max(1, ...rotasVisiveis.map((rota) => rota.total));
  const filtros = ["TODOS", ...metodos.map((m) => m.metodo)];

  return (
    <div className="uso-api">
      <div className="uso-api__numeros">
        <Numero
          titulo="Requisições recebidas"
          valor={formatarNumero(total)}
          explicacao="Total desde que o servidor foi ligado."
        />
        <Numero
          titulo="Por minuto"
          valor={porMinuto != null ? formatarNumero(porMinuto) : "—"}
          explicacao="Ritmo atual de uso, medido entre as duas últimas leituras."
        />
        <Numero
          titulo="Tempo médio"
          valor={`${formatarNumero(tempoMedioMs)} ms`}
          explicacao="Quanto a API leva, em média, para atender uma requisição."
        />
      </div>

      <h3 className="uso-api__subtitulo">Por tipo de ação</h3>
      <PorTipoDeAcao metodos={metodos} total={total} />

      <div className="uso-api__cabecalho-tabela">
        <h3 className="uso-api__subtitulo">Todas as rotas acessadas</h3>
        <div className="uso-api__filtros" role="group" aria-label="Filtrar por tipo de ação">
          {filtros.map((opcao) => (
            <button
              key={opcao}
              type="button"
              aria-pressed={filtro === opcao}
              className={filtro === opcao ? "ativo" : ""}
              onClick={() => setFiltro(opcao)}
            >
              {opcao === "TODOS" ? "Todas" : opcao}
            </button>
          ))}
        </div>
      </div>

      {rotasVisiveis.length === 0 ? (
        <p className="saude__sem-detalhes">
          {filtro === "TODOS"
            ? "Nenhuma requisição ainda. Use o site (ver reportes, fazer login) e os números aparecem aqui."
            : `Nenhuma requisição do tipo ${filtro} (${ACOES[filtro]?.nome ?? filtro}) até agora.`}
        </p>
      ) : (
        <div className="uso-api__tabela">
          <table>
            <thead>
              <tr>
                <th>Rota</th>
                <th className="numero">Requisições</th>
                <th className="numero">Erros</th>
                <th className="numero">Tempo médio</th>
              </tr>
            </thead>
            <tbody>
              {rotasVisiveis.map((rota) => (
                <tr key={`${rota.metodo} ${rota.rota}`}>
                  <td>
                    <SeloMetodo metodo={rota.metodo} />
                    <code>{rota.rota}</code>
                  </td>
                  <td className="numero">
                    <span className="uso-api__barra-celula">
                      <span
                        className="uso-api__barra"
                        style={{ width: `${Math.max(4, (rota.total / maiorRota) * 100)}px` }}
                        aria-hidden="true"
                      />
                      {formatarNumero(rota.total)}
                    </span>
                  </td>
                  <td className={`numero ${rota.erros > 0 ? "uso-api__com-erro" : ""}`}>
                    {formatarNumero(rota.erros)}
                  </td>
                  <td className="numero">{formatarNumero(rota.tempoMedioMs)} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
