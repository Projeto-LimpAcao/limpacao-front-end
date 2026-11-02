import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

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
import { buscarEnderecoPorCep } from "../../../services/cepService";
import { filtrarReportes } from "../../../utils/filtrar";
import { lerImagemComoTexto } from "../../utils/formatar";
import { CAMINHOS } from "../../../rotas/caminhos";

const TAMANHO_MAXIMO_IMAGEM = 5 * 1024 * 1024;
const TIPOS_IMAGEM_SUPORTADOS = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

/* Como o formulário começa quando é um cadastro novo. */
const FORMULARIO_VAZIO = {
  titulo: "",
  cep: "",
  rua: "",
  numero: "",
  cidade: "",
  estado: "",
  localizacao: "",
  descricao: "",
  urgencia: "",
  imagens: [],
  multirao: null,
};

function montarEndereco(formulario) {
  return [
    String(formulario.rua ?? "").trim(),
    String(formulario.numero ?? "").trim()
      ? `nº ${String(formulario.numero).trim()}`
      : "",
    String(formulario.cidade ?? "").trim(),
    String(formulario.estado ?? "").trim(),
    String(formulario.cep ?? "").trim(),
  ]
    .filter(Boolean)
    .join(", ");
}

function montarLocalizacao(formulario) {
  const endereco = montarEndereco(formulario);
  return [String(formulario.localizacao ?? "").trim(), endereco]
    .filter(Boolean)
    .join(" - ");
}

function extrairReferencia(reporte) {
  const endereco = montarEndereco(reporte);
  const localizacao = String(reporte.localizacao ?? "");
  if (!endereco) return localizacao;

  const partes = localizacao.split(" - ");
  if (partes.at(-1) === endereco) {
    return partes.slice(0, -1).join(" - ");
  }
  return localizacao === endereco ? "" : localizacao;
}

export default function Reportes({ somenteMeus = false }) {
  const { usuario, sair } = useAuth();
  const navegar = useNavigate();
  const local = useLocation();

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
    registrarHistoricoMensagens,
    enviarMensagem,
    registrarMensagemRecebida,
    enviarOferta,
  } = useRelatorios(Boolean(usuario), somenteMeus);


  const [filtros, setFiltros] = useState({
    busca: "",
    urgencia: "todas",
    status: "todos",
    ordenacao: "recentes",
  });

  const [formAberto, setFormAberto] = useState(
    () => Boolean(usuario && local.state?.abrirFormularioReporte),
  );
  const [editandoId, setEditandoId] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO);
  const [erros, setErros] = useState({});
  const [erroForm, setErroForm] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erroCep, setErroCep] = useState("");
  const requisicaoCep = useRef(null);

  const [idChat, setIdChat] = useState(null);
  const [idAjuda, setIdAjuda] = useState(null);
  const [paraExcluir, setParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  const [aviso, setAviso] = useState("");
  const [erroAcao, setErroAcao] = useState("");

  useEffect(
    () => () => requisicaoCep.current?.abort(),
    [],
  );

  useEffect(() => {
    if (!somenteMeus || !usuario || !erro.includes("Sua sessão expirou")) return;
    sair();
    navegar(CAMINHOS.login, { replace: true });
  }, [erro, navegar, sair, somenteMeus, usuario]);

  const lista = filtrarReportes(somenteMeus ? meusRelatorios : relatorios, filtros);
  const reporteChat = relatorios.find((r) => r.id === idChat) ?? null;
  const reporteAjuda = relatorios.find((r) => r.id === idAjuda) ?? null;

  /* ---------------- 2. Ações ---------------- */

  const exigirLogin = () => {
    if (usuario) return true;
    navegar(CAMINHOS.login);
    return false;
  };

  const alterarFiltro = (campo, valor) =>
    setFiltros((atual) => ({ ...atual, [campo]: valor }));

  const alterarFormulario = (campo, valor) => {
    if (campo === "cep") {
      requisicaoCep.current?.abort();
      requisicaoCep.current = null;
      setBuscandoCep(false);
      setErroCep("");
    }
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
    /* Some com o erro do campo assim que a pessoa começa a corrigir. */
    setErros((atual) => ({ ...atual, [campo]: "" }));
  };

  const abrirNovo = () => {
    if (!exigirLogin()) return;
    setEditandoId(null);
    setFormulario(FORMULARIO_VAZIO);
    setErros({});
    setErroForm("");
    setFormAberto(true);
  };

  useEffect(() => {
    if (!local.state?.abrirFormularioReporte) return;
    navegar(local.pathname, { replace: true, state: null });
  }, [local.pathname, local.state, navegar]);

  const abrirEdicao = (reporte) => {
    if (!exigirLogin()) return;
    requisicaoCep.current?.abort();
    requisicaoCep.current = null;
    setBuscandoCep(false);
    setEditandoId(reporte.id);
    setFormulario({
      titulo: reporte.titulo,
      cep: reporte.cep ?? "",
      rua: reporte.rua ?? "",
      numero: reporte.numero ?? "",
      cidade: reporte.cidade ?? "",
      estado: reporte.estado ?? "",
      localizacao: extrairReferencia(reporte),
      descricao: reporte.descricao,
      urgencia: reporte.urgencia,
      imagens: reporte.imagens,
      multirao: reporte.multirao,
      status: reporte.status,
    });
    setErros({});
    setErroForm("");
    setFormAberto(true);
  };

  const fecharFormulario = () => {
    requisicaoCep.current?.abort();
    requisicaoCep.current = null;
    setBuscandoCep(false);
    setFormAberto(false);
  };

  const buscarCep = async (cepInformado) => {
    requisicaoCep.current?.abort();
    const controller = new AbortController();
    requisicaoCep.current = controller;
    setBuscandoCep(true);
    setErroCep("");

    try {
      const endereco = await buscarEnderecoPorCep(cepInformado, {
        signal: controller.signal,
      });
      setFormulario((atual) => ({
        ...atual,
        cep: endereco.cep,
        rua: endereco.rua,
        localizacao: endereco.bairro || atual.localizacao,
        cidade: endereco.cidade,
        estado: endereco.estado,
      }));
      setErros((atual) => ({
        ...atual,
        cep: "",
        rua: "",
        cidade: "",
        estado: "",
        localizacao: endereco.bairro ? "" : atual.localizacao,
      }));
      return true;
    } catch (problema) {
      if (problema.name !== "AbortError" && requisicaoCep.current === controller) {
        setErroCep(
          problema.message || "Não foi possível consultar o CEP.",
        );
      }
      return false;
    } finally {
      if (requisicaoCep.current === controller) {
        requisicaoCep.current = null;
        setBuscandoCep(false);
      }
    }
  };

  const selecionarImagem = async (evento) => {
    const arquivos = Array.from(evento.target.files ?? []);
    evento.target.value = "";
    if (arquivos.length === 0) return;

    const imagensAtuais = formulario.imagens ?? [];
    const espacoDisponivel = 5 - imagensAtuais.length;
    const imagensValidas = [];
    const errosArquivo = [];

    arquivos.forEach((arquivo) => {
      if (!TIPOS_IMAGEM_SUPORTADOS.includes(arquivo.type)) {
        errosArquivo.push(`${arquivo.name}: formato não suportado.`);
      } else if (arquivo.size > TAMANHO_MAXIMO_IMAGEM) {
        errosArquivo.push(`${arquivo.name}: tamanho máximo de 5 MB.`);
      } else if (imagensValidas.length < espacoDisponivel) {
        imagensValidas.push(arquivo);
      } else {
        errosArquivo.push("Cada reporte pode ter no máximo 5 imagens.");
      }
    });

    if (imagensValidas.length === 0) {
      setErroForm(errosArquivo.join(" "));
      return;
    }

    setErroForm("");
    try {
      const imagens = await Promise.all(
        imagensValidas.map((arquivo) => lerImagemComoTexto(arquivo)),
      );
      if (imagens.some((imagem) => typeof imagem !== "string")) {
        throw new Error("Não foi possível converter uma das imagens.");
      }
      setFormulario((atual) => ({
        ...atual,
        imagens: [...(atual.imagens ?? []), ...imagens],
      }));
      setErros((atual) => ({ ...atual, imagens: "" }));
      if (errosArquivo.length > 0) setErroForm(errosArquivo.join(" "));
    } catch (problema) {
      setErroForm(problema.message);
    }
  };

  const removerImagem = (indice) => {
    setFormulario((atual) => ({
      ...atual,
      imagens: (atual.imagens ?? []).filter((_, atualIndice) => atualIndice !== indice),
    }));
    setErros((atual) => ({
      ...atual,
      imagens:
        (formulario.imagens?.length ?? 0) <= 1
          ? "Adicione pelo menos uma imagem."
          : "",
    }));
    setErroForm("");
  };

  /* Validação no front. O backend deve validar de novo — nunca confie
     só no que vem do navegador. */
  const validar = () => {
    const novos = {};

    if (!formulario.titulo.trim()) novos.titulo = "Informe um título.";
    if (formulario.cep.replace(/\D/g, "").length !== 8) {
      novos.cep = "Informe um CEP válido com 8 dígitos.";
    }
    if (!formulario.rua.trim()) novos.rua = "Informe a rua.";
    if (!formulario.numero.trim()) novos.numero = "Informe o número ou S/N.";
    if (!formulario.cidade.trim()) novos.cidade = "Informe a cidade.";
    if (!formulario.estado.trim()) novos.estado = "Informe o estado.";
    if (!formulario.localizacao.trim()) {
      novos.localizacao = "Informe o bairro ou ponto de referência.";
    }
    if (!formulario.descricao.trim()) novos.descricao = "Descreva o problema.";
    if (!formulario.urgencia) novos.urgencia = "Selecione a urgência.";
    if (formulario.multirao == null) {
      novos.multirao = "Selecione Sim ou Não para a organização do mutirão.";
    }
    if ((formulario.imagens?.length ?? 0) === 0) {
      novos.imagens = "Adicione pelo menos uma imagem.";
    }

    setErros(novos);
    return Object.keys(novos).length === 0;
  };

  const salvar = async () => {
    if (!validar()) return;

    setSalvando(true);
    setErroForm("");

    try {
      const formularioComLocalizacao = {
        ...formulario,
        localizacao: montarLocalizacao(formulario),
      };

      if (editandoId) {
        await atualizar(editandoId, formularioComLocalizacao);
        setAviso("Reporte atualizado.");
      } else {
        await criar(formularioComLocalizacao);
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
    if (!exigirLogin()) return;
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

  const abrirChat = (id) => {
    if (!exigirLogin()) return;
    setIdChat(id);
    carregarDetalhes(id).catch(() => setErroAcao("Não foi possível carregar o chat."));
  };

  /* Se já estou ajudando, o clique desfaz. Se não, abre o formulário. */
  const aoClicarAjudar = (reporte) => {
    if (!exigirLogin()) return;
    if (reporte.minhaParticipacao.ajudando) {
      alternarParticipacao(reporte.id, "ajudando");
      return;
    }

    setIdAjuda(reporte.id);
  };

  const mudarStatus = async (reporte, novoStatus) => {
    if (!exigirLogin()) return;
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
        filtroAtivo={filtros.status}
        meusAtivo={somenteMeus}
        onFiltrar={(valor) => alterarFiltro("status", valor)}
        onVerMeus={() => navegar(CAMINHOS.meusReportes)}
      />

      <Container>
        <div className="reportes">
          <header className="reportes__cabecalho">
            <div className="reportes__cabecalho-texto">
              <h2 className="reportes__titulo">
                {somenteMeus ? "Meus reportes" : "Reportes da comunidade"}
              </h2>
              <p className="reportes__descricao">
                {somenteMeus
                  ? `Olá, ${usuario.nome}. Aqui estão os reportes que você criou — dá pra editar, mudar o status e excluir.`
                  : "Veja os problemas ambientais reportados pelas comunidades e ofereça ajuda."}
              </p>
            </div>
            {somenteMeus && (
              <Botao
                variante="secundario"
                icone={<ArrowLeft size={18} />}
                onClick={() => navegar(CAMINHOS.reportes)}
              >
                Reportes da comunidade
              </Botao>
            )}
          </header>

          <PainelFiltros
            filtros={filtros}
            onAlterar={alterarFiltro}
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
                  ? "Encontrou um problema na sua região? Cadastre o primeiro e mobilize a comunidade."
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
                    estaLogado={Boolean(usuario)}
                    onEditar={() => abrirEdicao(reporte)}
                    onExcluir={() => setParaExcluir(reporte)}
                    onAbrirChat={() => abrirChat(reporte.id)}
                    onAjudar={() => aoClicarAjudar(reporte)}
                    onParticipar={() => {
                      if (exigirLogin()) {
                        alternarParticipacao(reporte.id, "participando");
                      }
                    }}
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
        onFechar={fecharFormulario}
        titulo={editandoId ? "Editar reporte" : "Reportar área poluída"}
        onConfirmar={salvar}
        rotuloConfirmar={editandoId ? "Salvar alterações" : "Enviar reporte"}
        confirmando={salvando || buscandoCep}
        largura="680px"
      >
        <FormularioReporte
          formulario={formulario}
          onAlterar={alterarFormulario}
          erros={erros}
          erroGeral={erroForm}
          onBuscarCep={buscarCep}
          buscandoCep={buscandoCep}
          erroCep={erroCep}
          onArquivoSelecionado={selecionarImagem}
          onRemoverImagem={removerImagem}
        />
      </Modal>

      {reporteChat && (
        <ModalChat
          key={`${reporteChat.id}-${Boolean(usuario)}`}
          reporte={reporteChat}
          usuario={usuario}
          onFechar={() => setIdChat(null)}
          onEnviar={enviarMensagem}
          onMensagemRecebida={registrarMensagemRecebida}
          onHistoricoCarregado={registrarHistoricoMensagens}
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
