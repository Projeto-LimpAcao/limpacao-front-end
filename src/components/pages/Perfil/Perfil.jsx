import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  User,
  FileText,
  CheckCircle2,
  LogOut,
  Palette,
  Check,
  Moon,
  Sun,
  Save,
} from "lucide-react";

import "./Perfil.css";
import {
  AppLayout,
  Container,
  Section,
  Grid,
  Avatar,
  Botao,
} from "../../index";
import InputTexto from "../../atomos/InputTexto/Inputexto";
import {
  PALETAS_TEMA,
  useAuth,
  usePaletaTema,
  useRelatorios,
} from "../../../hooks";
import { CAMINHOS } from "../../../rotas/caminhos";

/**
 * Dados do usuário logado e um resumo da participação dele.
 */
export default function Perfil() {
  const { usuario, sair, atualizarPerfil } = useAuth();
  const { meusRelatorios } = useRelatorios(Boolean(usuario), Boolean(usuario));
  const {
    paleta,
    selecionarPaleta,
    modoEscuro,
    definirModoEscuro,
    carregando: carregandoPreferencias,
    salvando: salvandoPreferencias,
    erro: erroPreferencias,
  } = usePaletaTema(usuario?.email);
  const navegar = useNavigate();
  const [nome, setNome] = useState(usuario?.nome ?? "");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erroPerfil, setErroPerfil] = useState("");
  const [sucessoPerfil, setSucessoPerfil] = useState("");
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);

  if (!usuario) {
    return (
      <AppLayout>
        <Container>
          <div className="perfil">
            <Section titulo="Acesso necessário" descricao="Você precisa entrar na sua conta para ver o perfil.">
              <p>Faça login para continuar.</p>
              <Botao onClick={() => navegar(CAMINHOS.login, { replace: true })}>
                Ir para o login
              </Botao>
            </Section>
          </div>
        </Container>
      </AppLayout>
    );
  }

  const resolvidos = meusRelatorios.filter((r) => r.status === "resolved").length;

  const aoSair = () => {
    navegar(CAMINHOS.reportes, { replace: true });
    sair();
  };

  const salvarAlteracoesPerfil = async (evento) => {
    evento.preventDefault();
    setErroPerfil("");
    setSucessoPerfil("");

    const nomeFinal = nome.trim();
    if (!nomeFinal) {
      setErroPerfil("Informe seu nome.");
      return;
    }
    if (novaSenha && !senhaAtual) {
      setErroPerfil("Informe a senha atual para definir uma nova senha.");
      return;
    }
    if (novaSenha && novaSenha.length < 6) {
      setErroPerfil("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErroPerfil("A confirmação da nova senha não corresponde.");
      return;
    }
    if (!novaSenha && senhaAtual) {
      setErroPerfil("Informe a nova senha ou limpe o campo da senha atual.");
      return;
    }
    if (nomeFinal === usuario.nome && !novaSenha) {
      setErroPerfil("Altere seu nome ou preencha os campos para trocar a senha.");
      return;
    }

    setSalvandoPerfil(true);
    try {
      const atualizado = await atualizarPerfil({
        nome: nomeFinal,
        senhaAtual: novaSenha ? senhaAtual : null,
        novaSenha: novaSenha || null,
      });
      setNome(atualizado.nome);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      setSucessoPerfil("Seus dados foram atualizados.");
    } catch (problema) {
      setErroPerfil(problema.message);
    } finally {
      setSalvandoPerfil(false);
    }
  };

  return (
    <AppLayout>
      <Container>
        <div className="perfil">
          <Section titulo="Meu perfil" descricao="Seus dados na plataforma.">
            <div className="perfil__cabecalho">
              <Avatar nome={usuario.nome} tamanho="grande" />

              <div>
                <h2 className="perfil__nome">{usuario.nome}</h2>
                <p className="perfil__email">{usuario.email}</p>
              </div>
            </div>

            <section className="perfil__paletas" aria-labelledby="perfil-paletas-titulo">
              <div className="perfil__paletas-cabecalho">
                <Palette size={18} aria-hidden="true" />
                <div>
                  <h3 id="perfil-paletas-titulo">Paleta de cores</h3>
                  <p>Personalize as cores do projeto neste navegador.</p>
                </div>
              </div>

              {carregandoPreferencias && (
                <p className="perfil__preferencias-status" role="status">
                  Carregando preferências salvas...
                </p>
              )}
              {salvandoPreferencias && (
                <p className="perfil__preferencias-status" role="status">
                  Salvando preferências...
                </p>
              )}
              {erroPreferencias && (
                <p className="perfil__preferencias-erro" role="alert">
                  {erroPreferencias}
                </p>
              )}

              <div className="perfil__paletas-opcoes" role="group" aria-label="Paletas de cores">
                {PALETAS_TEMA.map((opcao) => (
                  <button
                    key={opcao.id}
                    type="button"
                    className={`perfil__paleta ${
                      paleta === opcao.id ? "perfil__paleta--ativa" : ""
                    }`}
                    onClick={() => void selecionarPaleta(opcao.id)}
                    disabled={carregandoPreferencias || salvandoPreferencias}
                    aria-pressed={paleta === opcao.id}
                    aria-label={`Selecionar paleta ${opcao.nome}`}
                  >
                    <span
                      className="perfil__paleta-amostra"
                      aria-hidden="true"
                      style={{
                        background: `linear-gradient(135deg, ${opcao.cores.join(", ")})`,
                      }}
                    >
                      {paleta === opcao.id && <Check size={17} />}
                    </span>
                    <span>{opcao.nome}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="perfil__tema" aria-labelledby="perfil-tema-titulo">
              <div>
                <h3 id="perfil-tema-titulo">Aparência</h3>
                <p>
                  {modoEscuro
                    ? "O tema escuro está ativado."
                    : "O tema claro está ativado."}
                </p>
              </div>
              <Botao
                variante="secundario"
                onClick={() => void definirModoEscuro(!modoEscuro)}
                disabled={carregandoPreferencias || salvandoPreferencias}
                icone={modoEscuro ? <Sun size={16} /> : <Moon size={16} />}
                ariaLabel={modoEscuro ? "Ativar tema claro" : "Ativar tema escuro"}
              >
                {modoEscuro ? "Usar tema claro" : "Usar tema escuro"}
              </Botao>
            </section>

            <Grid colunas={2} minimo="240px">
              <div className="perfil__campo">
                <span className="perfil__campo-label">
                  <User size={15} /> Nome
                </span>
                <strong className="perfil__campo-valor">{usuario.nome}</strong>
              </div>

              <div className="perfil__campo">
                <span className="perfil__campo-label">
                  <Mail size={15} /> E-mail
                </span>
                <strong className="perfil__campo-valor">{usuario.email}</strong>
              </div>

              <div className="perfil__campo">
                <span className="perfil__campo-label">
                  <FileText size={15} /> Reportes criados
                </span>
                <strong className="perfil__campo-valor">
                  {meusRelatorios.length}
                </strong>
              </div>

              <div className="perfil__campo">
                <span className="perfil__campo-label">
                  <CheckCircle2 size={15} /> Resolvidos
                </span>
                <strong className="perfil__campo-valor">{resolvidos}</strong>
              </div>
            </Grid>

            <form className="perfil__formulario" onSubmit={salvarAlteracoesPerfil}>
              <div className="perfil__formulario-cabecalho">
                <h3>Dados da conta</h3>
                <p>Altere seu nome ou defina uma nova senha.</p>
              </div>

              <InputTexto
                label="Nome"
                obrigatorio
                value={nome}
                onChange={(evento) => setNome(evento.target.value)}
                desabilitado={salvandoPerfil}
                placeholder="Seu nome"
              />

              <div className="perfil__senhas">
                <InputTexto
                  type="password"
                  label="Senha atual"
                  value={senhaAtual}
                  onChange={(evento) => setSenhaAtual(evento.target.value)}
                  desabilitado={salvandoPerfil}
                  autoComplete="current-password"
                  placeholder="Obrigatória para trocar"
                />
                <InputTexto
                  type="password"
                  label="Nova senha"
                  value={novaSenha}
                  onChange={(evento) => setNovaSenha(evento.target.value)}
                  desabilitado={salvandoPerfil}
                  autoComplete="new-password"
                  placeholder="Mínimo de 6 caracteres"
                />
                <InputTexto
                  type="password"
                  label="Confirmar nova senha"
                  value={confirmarSenha}
                  onChange={(evento) => setConfirmarSenha(evento.target.value)}
                  desabilitado={salvandoPerfil}
                  autoComplete="new-password"
                  placeholder="Digite novamente"
                />
              </div>

              {erroPerfil && (
                <p className="perfil__formulario-erro" role="alert">
                  {erroPerfil}
                </p>
              )}
              {sucessoPerfil && (
                <p className="perfil__formulario-sucesso" role="status">
                  {sucessoPerfil}
                </p>
              )}

              <div className="perfil__formulario-acoes">
                <Botao
                  type="submit"
                  desabilitado={salvandoPerfil}
                  icone={<Save size={16} />}
                >
                  {salvandoPerfil ? "Salvando..." : "Salvar alterações"}
                </Botao>
              </div>
            </form>

            <div className="perfil__acoes">
              <Botao
                variante="secundario"
                onClick={() => navegar(CAMINHOS.meusReportes)}
              >
                Ver meus reportes
              </Botao>

              <Botao
                variante="perigo"
                onClick={aoSair}
                icone={<LogOut size={16} />}
              >
                Sair da conta
              </Botao>
            </div>
          </Section>
        </div>
      </Container>
    </AppLayout>
  );
}
