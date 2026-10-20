import { Search } from "lucide-react";

import "./PainelFiltros.css";
import Input from "../../atomos/InputTexto/Inputexto";
import Select from "../../atomos/Selecao/Selecao";
import { FILTRO_URGENCIA, FILTRO_STATUS, ORDENACOES } from "../../../config/listas";

export default function PainelFiltros({ filtros, onAlterar, mostrarStatus = true }) {
  return (
    <div className="painel-filtros">
      <Input
        icone={<Search size={18} />}
        placeholder="Buscar por título ou localização..."
        value={filtros.busca}
        onChange={(evento) => onAlterar("busca", evento.target.value)}
      />

      <div className="painel-filtros__selects">
        <Select
          label="Urgência"
          value={filtros.urgencia}
          onChange={(evento) => onAlterar("urgencia", evento.target.value)}
          opcoes={FILTRO_URGENCIA}
          placeholder=""
        />

        {mostrarStatus && (
          <Select
            label="Status"
            value={filtros.status}
            onChange={(evento) => onAlterar("status", evento.target.value)}
            opcoes={FILTRO_STATUS}
            placeholder=""
          />
        )}

        <Select
          label="Ordenar por"
          value={filtros.ordenacao}
          onChange={(evento) => onAlterar("ordenacao", evento.target.value)}
          opcoes={ORDENACOES}
          placeholder=""
        />
      </div>
    </div>
  );
}
