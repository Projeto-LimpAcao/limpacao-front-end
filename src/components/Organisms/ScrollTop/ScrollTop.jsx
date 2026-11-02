import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

import "./ScrollTop.css";

const LIMITE_VISIBILIDADE = 300;

export default function ScrollTop() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const atualizarVisibilidade = () => {
      setVisivel(window.scrollY > LIMITE_VISIBILIDADE);
    };

    atualizarVisibilidade();
    window.addEventListener("scroll", atualizarVisibilidade, { passive: true });

    return () => {
      window.removeEventListener("scroll", atualizarVisibilidade);
    };
  }, []);

  if (!visivel) return null;

  const voltarAoTopo = () => {
    const reduzirMovimento = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduzirMovimento) {
      window.scrollTo(0, 0);
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      className="scroll-top"
      type="button"
      onClick={voltarAoTopo}
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
    >
      <ArrowUp size={22} aria-hidden="true" />
    </button>
  );
}
