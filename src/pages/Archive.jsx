import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_ARCHIVE } from "../graphql/queries";
import "./Archive.css";

function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    ;[result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function Archive() {
  const { data, loading } = useQuery(GET_ARCHIVE);

  // Shuffled once per page load, not on every re-render.
  const items = useMemo(
    () => shuffle(data?.page?.archiveFields?.archiveMedia?.nodes ?? []),
    [data]
  );

  return (
    <div className="archive-page">
      <Link to="/" className="archive-nav-label">DOMENICA</Link>

      {!loading && items.length > 0 && (
        <div className="archive-grid">
          {items.map((item, i) => {
            const isVideo = (item.mimeType || "").startsWith("video/");
            const isGif = item.mimeType === "image/gif";
            const src = isGif
              ? item.sourceUrl.replace(/-scaled(\.[^.]+)$/, "$1")
              : item.sourceUrl;
            const rotation = ((i * 37) % 7 - 3).toFixed(1); // deterministic pseudo-random tilt

            return (
              <div
                key={i}
                className="archive-item"
                style={{ "--rotate": `${rotation}deg` }}
              >
                {isVideo ? (
                  <video src={item.mediaItemUrl} autoPlay loop muted playsInline />
                ) : (
                  <img src={src} alt={item.altText || ""} loading="lazy" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
