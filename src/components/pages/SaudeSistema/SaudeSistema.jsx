import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  CircleAlert,
  CircleCheck,
  CircleX,
  Cpu,
  Database,
  Globe,
  HardDrive,
  HeartPulse,
  RefreshCw,
} from "lucide-react";

import "./SaudeSistema.css";
import GraficoTempoResposta from "./GraficoTempoResposta";
import UsoApi from "./UsoApi";
import { AppLayout, Botao, Carregando, Container } from "../../index";
import Alerta from "../../moleculas/Alerta/Alerta";
import { buscarRequisicoes, buscarSaude } from "../../../services/saudeService";
import { notificar } from "../../../utils/notificar";
import {
  TAMANHO_HISTORICO,
  adicionarAoHistorico,
  classificarTempo,
  contarPorStatus,
  formatarDetalhe,
  impactoDoComponente,
  traduzirErro,
  infoStatus,
  listarComponentes,
  resumirHistorico,
  resumoGeral,
} from "../../../utils/saude";

const INTERVALO_MS = 15000;

const ICONES = {
  db: Database,
  diskSpace: HardDrive,
  brasilApi: Globe,
  hardware: Cpu,
};

const ICONES_STATUS = {
  up: CircleCheck,
  degraded: CircleAlert,
  down: CircleX,
  unknown: CircleAlert,
};

const LEGENDA = [
  { classe: "up", rotulo: "Funcionando" },
  { classe: "degraded", rotulo: "Com problemas" },
  { classe: "down", rotulo: "Fora do ar" },
];

function avisarMudanca(anterior, atual) {
  if (!anterior || anterior === atual) return;

  const { titulo } = resumoGeral(atual);
  const { classe } = infoStatus(atual);
  if (classe === "up") {
    notificar.sucesso("O sistema voltou a funcionar normalmente.");
  } else if (classe === "down") {
    notificar.erro(`Atenção: ${titulo.toLowerCase()}.`);
  } else {
    notificar.aviso(`Atenção: ${titulo.toLowerCase()}.`);
  }
}

function Legenda() {
  return (
    <ul className="saude__legenda" aria-label="Legenda das cores">
      {LEGENDA.map(({ classe, rotulo }) => (
        <li key={classe}>
          <span className={`saude__legenda-cor saude__marco--${classe}`} aria-hidden="true" />
          {rotulo}
        </li>
      ))}
    </ul>
  );
}

function SeloStatus({ status }) {
  const { classe, rotulo } = infoStatus(status);
  return (
    <span className={`saude-selo saude-selo--${classe}`}>
      <span className="saude-selo__ponto" aria-hidden="true" />
      {rotulo}
    </span>
  );
}

function FaixaStatus({ status, resposta, ultimaVerificacao }) {
  const { classe } = infoStatus(status);
  const { titulo, texto } = resumoGeral(status);
  const Icone = ICONES_STATUS[classe];

  return (
    <section className={`saude-faixa saude-faixa--${classe}`} aria-live="polite">
      <Icone className="saude-faixa__icone" size={48} aria-hidden="true" />
      <div className="saude-faixa__textos">
        <h2>{titulo}</h2>
        <p>{texto}</p>
        <span className="saude-faixa__tecnico">
          Última verificação às {ultimaVerificacao.toLocaleTimeString("pt-BR")} · código técnico:{" "}
          <code>{status}</code>
          {resposta && <> · HTTP {resposta.httpStatus}</>}
        </span>
      </div>
    </section>
  );
}

function Indicador({ titulo, valor, selo, explicacao }) {
  return (
    <div className="saude-kpi">
      <span className="saude-kpi__rotulo">{titulo}</span>
      <span className="saude-kpi__linha">
        <strong className="saude-kpi__valor">{valor}</strong>
        {selo}
      </span>
      <span className="saude-kpi__detalhe">{explicacao}</span>
    </div>
  );
}

function SeloVelocidade({ ms }) {
  const rotulo = classificarTempo(ms);
  const classe = { Rápido: "up", Normal: "degraded", Lento: "down" }[rotulo];
  return <span className={`saude-selo saude-selo--${classe}`}>{rotulo}</span>;
}

function Historico({ verificacoes }) {
  return (
    <section className="saude-painel" aria-label="Histórico das verificações">
      <header className="saude-painel__topo">
        <div>
          <h2>Histórico das verificações</h2>
          <p>
            Cada quadrado é uma verificação, feita a cada {INTERVALO_MS / 1000} segundos. As mais
            recentes ficam à direita. Passe o mouse para ver a hora.
          </p>
        </div>
        <Legenda />
      </header>

      <ol className="saude__linha-tempo">
        {verificacoes.map(({ hora, status, tempoMs }) => {
          const { classe, rotulo } = infoStatus(status);
          const descricao = `${hora.toLocaleTimeString("pt-BR")} · ${rotulo}${
            tempoMs != null ? ` · ${tempoMs} ms` : ""
          }`;
          return (
            <li
              key={hora.getTime()}
              className={`saude__marco saude__marco--${classe}`}
              title={descricao}
              aria-label={descricao}
            />
          );
        })}
      </ol>
      <span className="saude__nota">
        Guarda as últimas {TAMANHO_HISTORICO} verificações (cerca de{" "}
        {(TAMANHO_HISTORICO * INTERVALO_MS) / 60000} minutos). Recomeça ao recarregar a página.
      </span>
    </section>
  );
}

function CardComponente({ componente }) {
  const { nome, status, titulo, descricao, detalhes } = componente;
  const Icone = ICONES[nome] ?? Activity;
  const { classe } = infoStatus(status);
  const { error: erro, ...demais } = detalhes;

  return (
    <article className={`saude-card saude-card--${classe}`}>
      <header className="saude-card__topo">
        <span className="saude-card__icone" aria-hidden="true">
          <Icone size={20} />
        </span>
        <div className="saude-card__titulos">
          <h3>{titulo}</h3>
          {descricao && <p>{descricao}</p>}
        </div>
      </header>

      <div className="saude-card__situacao">
        <SeloStatus status={status} />
        <p>{impactoDoComponente(nome, status)}</p>
      </div>

      <dl className="saude-card__detalhes">
        <div className="saude-card__linha">
          <dt>Nome no Actuator</dt>
          <dd>
            <code>{nome}</code>
          </dd>
        </div>
        {Object.entries(demais).map(([chave, valor]) => {
          const item = formatarDetalhe(chave, valor);
          return (
            <div key={chave} className="saude-card__linha">
              <dt>{item.rotulo}</dt>
              <dd>{item.valor}</dd>
            </div>
          );
        })}
      </dl>
      {erro && (
        <p className="saude-card__erro" title={String(erro)}>
          {traduzirErro(erro)}
        </p>
      )}
    </article>
  );
}

export default function SaudeSistema() {
  const [saude, setSaude] = useState(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [atualizadoEm, setAtualizadoEm] = useState(null);
  const [resposta, setResposta] = useState(null);
  const [historico, setHistorico] = useState([]);
  const emAndamento = useRef(false);
  const ultimoStatus = useRef(null);
  const [metricas, setMetricas] = useState(null);
  const [porMinuto, setPorMinuto] = useState(null);
  const leituraAnterior = useRef(null);

  const carregarRequisicoes = useCallback(async () => {
    try {
      const dados = await buscarRequisicoes();
      const agora = Date.now();
      const anterior = leituraAnterior.current;
      if (anterior && dados.total >= anterior.total && agora > anterior.hora) {
        const minutos = (agora - anterior.hora) / 60000;
        setPorMinuto(Math.round((dados.total - anterior.total) / minutos));
      }
      leituraAnterior.current = { total: dados.total, hora: agora };
      setMetricas(dados);
    } catch {
      return;
    }
  }, []);

  const registrar = useCallback((status, tempoMs) => {
    avisarMudanca(ultimoStatus.current, status);
    ultimoStatus.current = status;
    setHistorico((atual) =>
      adicionarAoHistorico(atual, { hora: new Date(), status, tempoMs }),
    );
  }, []);

  const carregar = useCallback(async () => {
    if (emAndamento.current) return;
    emAndamento.current = true;
    setCarregando(true);

    try {
      const { dados, httpStatus, tempoMs } = await buscarSaude();
      setSaude(dados);
      setResposta({ httpStatus, tempoMs });
      setErro("");
      setAtualizadoEm(new Date());
      registrar(dados.status, tempoMs);
      await carregarRequisicoes();
    } catch (problema) {
      setErro(problema.message);
      setResposta(null);
      registrar("SEM_RESPOSTA", null);
    } finally {
      emAndamento.current = false;
      setCarregando(false);
    }
  }, [registrar, carregarRequisicoes]);

  useEffect(() => {
    const primeira = setTimeout(carregar, 0);
    const intervalo = setInterval(carregar, INTERVALO_MS);
    return () => {
      clearTimeout(primeira);
      clearInterval(intervalo);
    };
  }, [carregar]);

  const componentes = listarComponentes(saude?.components);
  const contagem = contarPorStatus(componentes);
  const ultima = historico.at(-1);
  const statusAtual = ultima?.status ?? saude?.status;
  const semResposta = statusAtual === "SEM_RESPOSTA";
  const resumo = resumirHistorico(historico);
  const comProblema = contagem.degraded + contagem.down;

  return (
    <AppLayout>
      <Container>
        <div className="saude">
          <header className="saude__cabecalho">
            <div>
              <p className="saude__sobretitulo">
                <HeartPulse size={16} aria-hidden="true" /> Health Check
              </p>
              <h1>Saúde do sistema</h1>
              <p className="saude__subtitulo">
                Mostra se o LimpAção está funcionando. O painel pergunta ao servidor a cada{" "}
                {INTERVALO_MS / 1000} segundos se está tudo bem.
              </p>
            </div>

            <div className="saude__acoes">
              <Botao
                variante="secundario"
                tamanho="pequeno"
                onClick={carregar}
                desabilitado={carregando}
                icone={
                  <RefreshCw size={16} className={carregando ? "saude__girando" : ""} />
                }
              >
                Verificar agora
              </Botao>
            </div>
          </header>

          {erro && (
            <Alerta tipo="erro">
              {erro}
              {saude && " Os serviços abaixo mostram a última leitura recebida."}
            </Alerta>
          )}

          {historico.length === 0 && carregando && (
            <Carregando texto="Consultando o servidor..." />
          )}

          {ultima && (
            <>
              <FaixaStatus
                status={statusAtual}
                resposta={resposta}
                ultimaVerificacao={ultima.hora}
              />

              <section aria-label="Serviços monitorados" className="saude__servicos">
                <header>
                  <h2 className="saude__secao">Serviços monitorados</h2>
                  <p className="saude__subtitulo">
                    Cada cartão é uma parte do sistema que o servidor verifica. Os com problema
                    aparecem primeiro.
                  </p>
                </header>

                {semResposta && componentes.length > 0 && atualizadoEm && (
                  <p className="saude__sem-detalhes">
                    O servidor não está respondendo. Mostrando a última leitura, das{" "}
                    {atualizadoEm.toLocaleTimeString("pt-BR")}.
                  </p>
                )}

                {componentes.length > 0 ? (
                  <div
                    className={`saude__grade ${semResposta ? "saude__grade--antiga" : ""}`}
                  >
                    {componentes.map((componente) => (
                      <CardComponente key={componente.nome} componente={componente} />
                    ))}
                  </div>
                ) : (
                  <p className="saude__sem-detalhes">
                    {saude
                      ? "O servidor não enviou o detalhe dos serviços. Saia e entre novamente com a conta de administrador."
                      : "Ainda não foi possível ler os serviços: o servidor não respondeu."}
                  </p>
                )}
              </section>

              <section className="saude__kpis" aria-label="Indicadores">
                <Indicador
                  titulo="Disponibilidade"
                  valor={resumo.disponibilidade != null ? `${resumo.disponibilidade}%` : "—"}
                  explicacao={`O site estava no ar em ${resumo.disponiveis} de ${resumo.total} verificações.`}
                />

                <Indicador
                  titulo="Velocidade do servidor"
                  valor={resposta ? `${resposta.tempoMs} ms` : "—"}
                  selo={resposta && <SeloVelocidade ms={resposta.tempoMs} />}
                  explicacao={
                    resposta
                      ? `Média de ${resumo.tempoMedio} ms. Abaixo de 200 ms é rápido.`
                      : "O servidor não respondeu na última verificação."
                  }
                />

                <Indicador
                  titulo="Serviços funcionando"
                  valor={
                    !semResposta && componentes.length > 0
                      ? `${contagem.up} de ${componentes.length}`
                      : "—"
                  }
                  explicacao={
                    semResposta
                      ? "Sem resposta do servidor."
                      : componentes.length === 0
                        ? "O servidor não informou os serviços."
                        : comProblema === 0
                          ? "Nenhum serviço com problema."
                          : `${comProblema} serviço(s) com problema. Veja abaixo.`
                  }
                />
              </section>

              <Historico verificacoes={historico} />

              <section className="saude-painel" aria-label="Velocidade de resposta">
                <header className="saude-painel__topo">
                  <div>
                    <h2>Velocidade de resposta</h2>
                    <p>
                      Tempo que o servidor leva para responder, em milissegundos (1000 ms = 1
                      segundo). Quanto menor, melhor.
                    </p>
                  </div>
                </header>
                <GraficoTempoResposta verificacoes={historico} />
              </section>

              <section className="saude-painel" aria-label="Uso da API">
                <header className="saude-painel__topo">
                  <div>
                    <h2>Uso da API</h2>
                    <p>
                      Quantas requisições o servidor recebeu dos usuários do site. Não conta as
                      consultas deste painel.
                    </p>
                  </div>
                </header>
                <UsoApi metricas={metricas} porMinuto={porMinuto} indisponivel={semResposta} />
              </section>
            </>
          )}
        </div>
      </Container>
    </AppLayout>
  );
}
