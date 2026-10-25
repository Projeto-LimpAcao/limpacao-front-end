import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Reportes.css";
import {
  AppLayout,
  Container,
  Grid,
  Alerta,
  Carregando,
  Modal,
  Botao,
  CardReporte,
  EstadoVazio,
  FormularioReporte,
  ModalAjuda,
  ModalChat,
  PainelEstatisticas,
  PainelFiltros,
} from "../../index";
import { useAuth, useRelatorios } from "../../../hooks";
import { filtrarReportes } from "../../../utils/filtrar";
import { CAMINHOS } from "../../../rotas/caminhos";

/* Como o formulário começa quando é um cadastro novo. */
const FORMULARIO_VAZIO = {
  titulo: "",
  localizacao: "",
  descricao: "",
  urgencia: "medium",
  imagem: "",
  multirao: false,
};

/**
 * Lista de reportes.
 *
 * A MESMA página atende duas rotas:
 *   /                → todos os reportes
 *   /meus-reportes   → só os meus (somenteMeus)
 *
 * É a tela mais cheia do app, então ela está dividida em blocos:
 *   1. estado (o que está aberto, o que está sendo editado)
 *   2. ações (salvar, excluir, ajudar...)
 *   3. o que aparece na tela
 */
export default function Reportes({ somenteMeus = false }) {
  const { usuario } = useAuth();
  const navegar = useNavigate();

  const {
    relatorios,
    meusRelatorios,
    estatisticas,
    carregando,
    erro,
    criar,
    atualizar,
    excluir,
    alterarStatus,
    alternarParticipacao,
    carregarDetalhes,
    enviarMensagem,
    enviarOferta,
  } = useRelatorios();

  /* ---------------- 1. Estado da tela ---------------- */

  const [filtros, setFiltros] = useState({
    busca: "",
    urgencia: "todas",
    status: "todos",
    ordenacao: "recentes",
  });

  const [formAberto, setFormAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO);
  const [erros, setErros] = useState({});
  const [erroForm, setErroForm] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [idChat, setIdChat] = useState(null);
  const [idAjuda, setIdAjuda] = useState(null);
  const [paraExcluir, setParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  const [aviso, setAviso] = useState("");
  const [erroAcao, setErroAcao] = useState("");

  const lista = filtrarReportes(somenteMeus ? meusRelatorios : relatorios, filtros);
  const reporteChat = relatorios.find((r) => r.id === idChat) ?? null;
  const reporteAjuda = relatorios.find((r) => r.id === idAjuda) ?? null;

  /* ---------------- 2. Ações ---------------- */

  const alterarFiltro = (campo, valor) =>
    setFiltros((atual) => ({ ...atual, [campo]: valor }));

  const alterarFormulario = (campo, valor) => {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
    /* Some com o erro do campo assim que a pessoa começa a corrigir. */
    setErros((atual) => ({ ...atual, [campo]: "" }));
  };

  const abrirNovo = () => {
    setEditandoId(null);
    setFormulario(FORMULARIO_VAZIO);
    setErros({});
    setErroForm("");
    setFormAberto(true);
  };

  const abrirEdicao = (reporte) => {
    setEditandoId(reporte.id);
    setFormulario({
      titulo: reporte.titulo,
      localizacao: reporte.localizacao,
      descricao: reporte.descricao,
      urgencia: reporte.urgencia,
      imagem: reporte.imagem,
      multirao: reporte.multirao,
      status: reporte.status,
    });
    setErros({});
    setErroForm("");
    setFormAberto(true);
  };

  /* Validação no front. O backend deve validar de novo — nunca confie
     só no que vem do navegador. */
  const validar = () => {
    const novos = {};

    if (!formulario.titulo.trim()) novos.titulo = "Informe um título.";
    if (!formulario.localizacao.trim()) novos.localizacao = "Informe a localização.";
    if (!formulario.descricao.trim()) novos.descricao = "Descreva o problema.";

    setErros(novos);
    return Object.keys(novos).length === 0;
  };

  const salvar = async () => {
    if (!validar()) return;

    setSalvando(true);
    setErroForm("");

    try {
      if (editandoId) {
        await atualizar(editandoId, formulario);
        setAviso("Reporte atualizado.");
      } else {
        await criar(formulario);
        setAviso("Reporte cadastrado. Obrigado por ajudar!");
      }

      setFormAberto(false);
      setEditandoId(null);
      setFormulario(FORMULARIO_VAZIO);
    } catch (problema) {
      setErroForm(problema.message);
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExclusao = async () => {
    setExcluindo(true);
    setErroAcao("");

    try {
      await excluir(paraExcluir.id);
      setAviso(`"${paraExcluir.titulo}" foi excluído.`);
      setParaExcluir(null);
    } catch (problema) {
      setErroAcao(problema.message);
    } finally {
      setExcluindo(false);
    }
  };

  /* As mensagens só são buscadas quando alguém abre o chat. */
  const abrirChat = (id) => {
    setIdChat(id);
    carregarDetalhes(id).catch(() => setErroAcao("Não foi possível carregar o chat."));
  };

  /* Se já estou ajudando, o clique desfaz. Se não, abre o formulário. */
  const aoClicarAjudar = (reporte) => {
    if (reporte.minhaParticipacao.ajudando) {
      alternarParticipacao(reporte.id, "ajudando");
      return;
    }

    setIdAjuda(reporte.id);
  };

  const mudarStatus = async (reporte, novoStatus) => {
    setErroAcao("");

    try {
      await alterarStatus(reporte, novoStatus);
    } catch (problema) {
      setErroAcao(problema.message);
    }
  };

  /* ---------------- 3. Tela ---------------- */

  return (
    <AppLayout onNovoReporte={abrirNovo}>
      <PainelEstatisticas
        estatisticas={estatisticas}
        filtroAtivo={somenteMeus ? null : filtros.status}
        onFiltrar={
          somenteMeus ? undefined : (valor) => alterarFiltro("status", valor)
        }
        onVerMeus={() => navegar(CAMINHOS.meusReportes)}
      />

      <Container>
        <div className="reportes">
          <header className="reportes__cabecalho">
            <h2 className="reportes__titulo">
              {somenteMeus ? "Meus reportes" : "Reportes da comunidade"}
            </h2>
            <p className="reportes__descricao">
              {somenteMeus
                ? `Olá, ${usuario.nome}. Aqui estão os reportes que você criou — dá pra editar, mudar o status e excluir.`
                : "Veja o que a comunidade está reportando pela cidade e ofereça ajuda."}
            </p>
          </header>

          <PainelFiltros
            filtros={filtros}
            onAlterar={alterarFiltro}
            mostrarStatus={!somenteMeus}
          />

          <Alerta tipo="sucesso" onFechar={() => setAviso("")}>
            {aviso}
          </Alerta>

          <Alerta tipo="erro" onFechar={() => setErroAcao("")}>
            {erroAcao}
          </Alerta>

          {/* Os 3 estados de qualquer listagem: carregando, erro, conteúdo. */}
          {carregando ? (
            <Carregando texto="Carregando reportes..." />
          ) : erro ? (
            <Alerta tipo="erro">{erro}</Alerta>
          ) : lista.length === 0 ? (
            <EstadoVazio
              titulo={
                somenteMeus
                  ? "Você ainda não criou nenhum reporte"
                  : "Nenhum reporte encontrado"
              }
              descricao={
                somenteMeus
                  ? "Encontrou um problema na cidade? Cadastre o primeiro e mobilize a comunidade."
                  : "Ajuste os filtros ou seja a primeira pessoa a reportar."
              }
              rotuloAcao="Criar um reporte"
              onAcao={abrirNovo}
            />
          ) : (
            <>
              <Grid colunas={3} minimo="300px">
                {lista.map((reporte) => (
                  <CardReporte
                    key={reporte.id}
                    reporte={reporte}
                    onEditar={() => abrirEdicao(reporte)}
                    onExcluir={() => setParaExcluir(reporte)}
                    onAbrirChat={() => abrirChat(reporte.id)}
                    onAjudar={() => aoClicarAjudar(reporte)}
                    onParticipar={() =>
                      alternarParticipacao(reporte.id, "participando")
                    }
                    onMudarStatus={(novo) => mudarStatus(reporte, novo)}
                  />
                ))}
              </Grid>

              <p className="reportes__total">
                Mostrando {lista.length} de{" "}
                {somenteMeus ? meusRelatorios.length : relatorios.length} reporte(s)
              </p>
            </>
          )}
        </div>
      </Container>

      {/* ---------------- Modais ---------------- */}

      <Modal
        aberto={formAberto}
        onFechar={() => setFormAberto(false)}
        titulo={editandoId ? "Editar reporte" : "Reportar área poluída"}
        onConfirmar={salvar}
        rotuloConfirmar={editandoId ? "Salvar alterações" : "Enviar reporte"}
        confirmando={salvando}
        largura="680px"
      >
        <FormularioReporte
          formulario={formulario}
          onAlterar={alterarFormulario}
          erros={erros}
          erroGeral={erroForm}
        />
      </Modal>

      {reporteChat && (
        <ModalChat
          reporte={reporteChat}
          onFechar={() => setIdChat(null)}
          onEnviar={enviarMensagem}
        />
      )}

      {reporteAjuda && (
        <ModalAjuda
          reporte={reporteAjuda}
          onFechar={() => setIdAjuda(null)}
          onEnviar={enviarOferta}
        />
      )}

      <Modal
        aberto={Boolean(paraExcluir)}
        onFechar={() => setParaExcluir(null)}
        titulo="Excluir reporte"
        largura="440px"
      >
        <p>
          Tem certeza que quer excluir <strong>{paraExcluir?.titulo}</strong>? As
          mensagens e ofertas de ajuda também serão apagadas.
        </p>

        <div className="reportes__confirmacao">
          <Botao
            variante="secundario"
            onClick={() => setParaExcluir(null)}
            desabilitado={excluindo}
            larguraTotal
          >
            Cancelar
          </Botao>

          <Botao
            variante="perigo"
            onClick={confirmarExclusao}
            desabilitado={excluindo}
            larguraTotal
          >
            {excluindo ? "Excluindo..." : "Excluir"}
          </Botao>
        </div>
      </Modal>
    </AppLayout>
  );
}
