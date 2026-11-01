import { useNavigate } from "react-router-dom";
import { Mail, User, FileText, CheckCircle2, LogOut } from "lucide-react";

import "./Perfil.css";
import {
  AppLayout,
  Container,
  Section,
  Grid,
  Avatar,
  Botao,
} from "../../index";
import { useAuth, useRelatorios } from "../../../hooks";
import { CAMINHOS } from "../../../rotas/caminhos";

/**
 * Dados do usuário logado e um resumo da participação dele.
 */
export default function Perfil() {
  const { usuario, sair } = useAuth();
  const { meusRelatorios } = useRelatorios();
  const navegar = useNavigate();

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
    sair();
    navegar(CAMINHOS.login);
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
