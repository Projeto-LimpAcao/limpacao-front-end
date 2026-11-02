import { Link } from "react-router-dom";
import {
  ArrowRight,
  Camera,
  HandHeart,
  MapPin,
  MessageCircle,
  Recycle,
} from "lucide-react";

import "./Inicio.css";
import { AppLayout, Botao, Container } from "../../index";
import { CAMINHOS } from "../../../rotas/caminhos";

const BENEFICIOS = [
  {
    icone: <MapPin size={21} />,
    titulo: "Problemas no mapa da comunidade",
    texto: "Localize reportes e entenda o que precisa de atenção na sua região.",
  },
  {
    icone: <MessageCircle size={21} />,
    titulo: "Conversa que vira ação",
    texto: "Troque informações, combine apoio e acompanhe cada atualização.",
  },
  {
    icone: <HandHeart size={21} />,
    titulo: "Cada pessoa faz diferença",
    texto: "Ajude em uma iniciativa ou reúna vizinhos para cuidar de um espaço.",
  },
];

export default function Inicio() {
  return (
    <AppLayout>
      <div className="inicio">
        <Container>
          <section className="inicio__hero">
            <div className="inicio__conteudo">
              <span className="inicio__etiqueta">
                <Recycle size={16} aria-hidden="true" />
                Comunidade em movimento
              </span>
              <h1 className="inicio__titulo">
                Um lugar melhor começa com <span>uma atitude.</span>
              </h1>
              <p className="inicio__descricao">
                Encontre problemas ambientais perto de você, compartilhe o que
                precisa de atenção e conecte pessoas dispostas a transformar
                cuidado em ação.
              </p>
              <div className="inicio__acoes">
                <Link to={CAMINHOS.reportes}>
                  <Botao tamanho="grande" icone={<Camera size={18} />}>
                    Explorar reportes
                  </Botao>
                </Link>
                <Link className="inicio__link-trabalhos" to={CAMINHOS.trabalhos}>
                  Conheça os trabalhos <ArrowRight size={17} />
                </Link>
              </div>
              <p className="inicio__nota">
                Iniciativas locais. Impacto construído em conjunto.
              </p>
            </div>

            <div className="inicio__visual">
              <img
                src="/imagem-login.jpg"
                alt="Pessoas voluntárias cuidando de um espaço público"
              />
              <div className="inicio__selo">
                <span className="inicio__selo-icone">
                  <HandHeart size={20} />
                </span>
                <span>
                  <strong>Pequenas ações</strong>
                  <small>constroem grandes mudanças</small>
                </span>
              </div>
            </div>
          </section>

          <section className="inicio__beneficios" aria-labelledby="inicio-beneficios-titulo">
            <div className="inicio__secao-cabecalho">
              <p className="inicio__secao-etiqueta">Cuidado coletivo</p>
              <h2 id="inicio-beneficios-titulo">
                Da observação à transformação
              </h2>
              <p>
                Uma plataforma para aproximar quem identifica um problema e
                quem pode ajudar a resolvê-lo.
              </p>
            </div>

            <div className="inicio__beneficios-grade">
              {BENEFICIOS.map(({ icone, titulo, texto }, indice) => (
                <article className="inicio__beneficio" key={titulo}>
                  <span className="inicio__beneficio-numero">
                    0{indice + 1}
                  </span>
                  <span className="inicio__beneficio-icone">{icone}</span>
                  <h3>{titulo}</h3>
                  <p>{texto}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="inicio__chamada">
            <div>
              <p className="inicio__secao-etiqueta">O próximo passo é seu</p>
              <h2>Vamos cuidar do que é de todos?</h2>
              <p>
                Explore os reportes, conheça as ações e participe no seu ritmo.
              </p>
            </div>
            <Link to={CAMINHOS.reportes}>
              <Botao variante="secundario" tamanho="grande">
                Ver reportes da comunidade
              </Botao>
            </Link>
          </section>
        </Container>
      </div>
    </AppLayout>
  );
}
