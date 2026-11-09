import { useEffect, useRef, useState } from "react";
import {
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  useAdvancedMarkerRef,
  useMap,
} from "@vis.gl/react-google-maps";
import { AlertCircle, Clock } from "lucide-react";

import "./MapaReportes.css";
import { status as infoStatus } from "../../../config/listas";
import { GOOGLE_MAPS } from "../../../config/projeto";

const ICONE_STATUS = {
  pending: AlertCircle,
  "in-progress": Clock,
};

/* Só entram no mapa os reportes ainda não resolvidos e já localizados. */
function reportesNoMapa(reportes) {
  return reportes.filter(
    (reporte) =>
      reporte.status !== "resolved" &&
      Number.isFinite(reporte.latitude) &&
      Number.isFinite(reporte.longitude),
  );
}

function MarcadorReporte({ reporte, selecionado, onSelecionar, onFechar, children }) {
  const [refMarcador, marcador] = useAdvancedMarkerRef();
  const Icone = ICONE_STATUS[reporte.status] ?? AlertCircle;

  return (
    <>
      <AdvancedMarker
        ref={refMarcador}
        position={{ lat: reporte.latitude, lng: reporte.longitude }}
        title={`${reporte.titulo} — ${infoStatus(reporte.status).label}`}
        onClick={onSelecionar}
        zIndex={selecionado ? 10 : 1}
      >
        <span
          className={[
            "mapa-reportes__marcador",
            `mapa-reportes__marcador--${reporte.status}`,
            selecionado ? "mapa-reportes__marcador--selecionado" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <Icone size={18} aria-hidden="true" />
        </span>
      </AdvancedMarker>

      {selecionado && (
        <InfoWindow
          anchor={marcador}
          onCloseClick={onFechar}
          maxWidth={360}
          headerDisabled
          className="mapa-reportes__janela"
        >
          {children}
        </InfoWindow>
      )}
    </>
  );
}

/* Enquadra todos os marcadores na primeira vez que eles aparecem. */
function AjustarEnquadramento({ reportes }) {
  const mapa = useMap();
  const enquadrado = useRef(false);

  useEffect(() => {
    if (!mapa || enquadrado.current || reportes.length === 0) return;
    enquadrado.current = true;

    if (reportes.length === 1) {
      mapa.setCenter({ lat: reportes[0].latitude, lng: reportes[0].longitude });
      mapa.setZoom(15);
      return;
    }

    const limites = new window.google.maps.LatLngBounds();
    reportes.forEach((reporte) =>
      limites.extend({ lat: reporte.latitude, lng: reporte.longitude }),
    );
    mapa.fitBounds(limites, 64);
  }, [mapa, reportes]);

  return null;
}

/**
 * Mapa com um marcador por reporte não resolvido. Ao clicar no marcador,
 * abre o card do reporte (o mesmo da listagem) num balão sobre o mapa.
 */
export default function MapaReportes({ reportes = [], renderizarCard }) {
  const [selecionadoId, setSelecionadoId] = useState(null);
  const visiveis = reportesNoMapa(reportes);

  return (
    <div className="mapa-reportes">
      <ul className="mapa-reportes__legenda" aria-label="Legenda do mapa">
        {Object.entries(ICONE_STATUS).map(([valor, Icone]) => (
          <li key={valor}>
            <span className={`mapa-reportes__marcador mapa-reportes__marcador--${valor} mapa-reportes__marcador--legenda`}>
              <Icone size={13} aria-hidden="true" />
            </span>
            {infoStatus(valor).label}
          </li>
        ))}
      </ul>

      <div className="mapa-reportes__area">
        <GoogleMap
          mapId={GOOGLE_MAPS.mapId}
          defaultCenter={GOOGLE_MAPS.centroPadrao}
          defaultZoom={GOOGLE_MAPS.zoomPadrao}
          gestureHandling="cooperative"
          clickableIcons={false}
          streetViewControl={false}
          mapTypeControl={false}
          onClick={() => setSelecionadoId(null)}
        >
          <AjustarEnquadramento reportes={visiveis} />

          {visiveis.map((reporte) => (
            <MarcadorReporte
              key={reporte.id}
              reporte={reporte}
              selecionado={reporte.id === selecionadoId}
              onSelecionar={() => setSelecionadoId(reporte.id)}
              onFechar={() => setSelecionadoId(null)}
            >
              <div className="mapa-reportes__card">{renderizarCard(reporte)}</div>
            </MarcadorReporte>
          ))}
        </GoogleMap>
      </div>
    </div>
  );
}
