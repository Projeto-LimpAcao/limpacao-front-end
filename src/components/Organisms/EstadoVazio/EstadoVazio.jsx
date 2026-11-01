import { AlertCircle } from "lucide-react";

import "./EstadoVazio.css";
import Botao from "../../atomos/Botao/Botao";

export default function EstadoVazio({
  titulo = "Nenhum reporte encontrado",
  descricao = "Ajuste os filtros ou cadastre um novo reporte para ajudar a comunidade.",
  rotuloAcao,
  onAcao,
}) {
  return (
    <div className="estado-vazio">
      <AlertCircle size={48} className="estado-vazio__icone" />

      <h3 className="estado-vazio__titulo">{titulo}</h3>
      <p className="estado-vazio__descricao">{descricao}</p>

      {rotuloAcao && onAcao && (
        <Botao tamanho="grande" onClick={onAcao}>
          {rotuloAcao}
        </Botao>
      )}
    </div>
  );
}
