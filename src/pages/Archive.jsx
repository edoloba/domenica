import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_ARCHIVE_ITEMS, GET_ARCHIVE_PAGE, GET_ARCHIVE_PAGE_MEDIA } from "../graphql/queries";
import "./Archive.css";
import "../components/Gallery.css";

const NUMBER_OF_SHAPES = 14; // 14x14 lattice points on the sphere

function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    ;[result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function ease(t) {
  return t * t * t;
}

// Extracts ordered image IDs from Gutenberg rendered HTML (same technique as
// project/edition galleries — Gutenberg adds class="wp-image-{id}" to every image).
function extractGalleryOrder(content) {
  if (!content) return [];
  const ids = [];
  const re = /class="[^"]*wp-image-(\d+)[^"]*"/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    ids.push(Number(m[1]));
  }
  return ids;
}

export default function Archive() {
  const { data: itemsData } = useQuery(GET_ARCHIVE_ITEMS);
  const { data: pageData } = useQuery(GET_ARCHIVE_PAGE);

  const galleryIds = useMemo(
    () => extractGalleryOrder(pageData?.page?.content),
    [pageData]
  );
  const { data: pageMediaData } = useQuery(GET_ARCHIVE_PAGE_MEDIA, {
    variables: { ids: galleryIds },
    skip: !galleryIds.length,
  });

  const canvasRef = useRef(null);
  const pageRef = useRef(null);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const items = useMemo(() => {
    // Archive Item CPT posts (single file each — used mainly for video).
    const singleItems = (itemsData?.archiveItems?.nodes ?? [])
      .map((n) => n.archiveFields?.media?.node)
      .filter(Boolean);

    // Archive page's Gutenberg Gallery block (bulk images), ordered to match the editor.
    const rawGalleryMedia = pageMediaData?.mediaItems?.nodes ?? [];
    const galleryMedia = [...rawGalleryMedia].sort(
      (a, b) => galleryIds.indexOf(a.databaseId) - galleryIds.indexOf(b.databaseId)
    );

    return shuffle([...singleItems, ...galleryMedia]);
  }, [itemsData, galleryIds, pageMediaData]);

  useEffect(() => {
    if (!items.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;
    let width, height, radius, size, shapes;

    const touch = {
      mouse: { x: -99999, y: -99999 },
      delta: { x: 0, y: 0 },
      fingStart: { x: null, y: null },
    };

    // Live (hidden) media elements — kept in the DOM so gifs/videos keep animating;
    // canvas reads their current decoded frame every tick.
    const pool = items.map((item) => {
      const isVideo = (item.mimeType || "").startsWith("video/");
      const isGif = item.mimeType === "image/gif";
      const el = document.createElement(isVideo ? "video" : "img");
      if (isVideo) {
        el.src = item.mediaItemUrl;
        el.muted = true;
        el.loop = true;
        el.playsInline = true;
        el.autoplay = true;
      } else {
        el.src = isGif ? item.sourceUrl.replace(/-scaled(\.[^.]+)$/, "$1") : item.sourceUrl;
      }
      Object.assign(el.style, {
        position: "fixed",
        opacity: "0",
        pointerEvents: "none",
        width: "2px",
        height: "2px",
        top: "0",
        left: "0",
      });
      document.body.appendChild(el);

      const entry = { el, item, isVideo, loaded: false };
      if (isVideo) {
        el.addEventListener("loadeddata", () => {
          entry.loaded = true;
          el.play().catch(() => {});
        });
      } else {
        el.addEventListener("load", () => { entry.loaded = true; });
        if (el.complete && el.naturalWidth) entry.loaded = true;
      }
      return entry;
    });

    function setupShapes() {
      const edge = Math.max(width, height);
      radius = edge / 2;
      size = radius / (NUMBER_OF_SHAPES / 6);
      shapes = [];
      for (let x = 0; x < NUMBER_OF_SHAPES; x++) {
        for (let y = 0; y < NUMBER_OF_SHAPES; y++) {
          shapes.push({
            xRadian: ((Math.PI * 2) / NUMBER_OF_SHAPES) * x,
            yRadian: ((Math.PI * 2) / NUMBER_OF_SHAPES) * y,
            pool: pool[Math.floor(Math.random() * pool.length)],
          });
        }
      }
    }

    function resize() {
      width = canvas.width = pageRef.current.clientWidth;
      height = canvas.height = window.innerHeight;
      setupShapes();
    }

    resize();
    window.addEventListener("resize", resize);

    function onMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      touch.mouse.x = e.clientX - rect.left - width / 2;
      touch.mouse.y = e.clientY - rect.top - height / 2;
    }
    function onWheel(e) {
      e.preventDefault(); // stop trackpad horizontal swipe from triggering browser back/forward
      touch.delta.x += e.deltaX * 0.0005;
      touch.delta.y += e.deltaY * 0.0005;
    }
    function onTouchStart(e) {
      const t = e.targetTouches[0];
      touch.fingStart.x = t.pageX;
      touch.fingStart.y = t.pageY;
    }
    function onTouchMove(e) {
      const t = e.targetTouches[0];
      const dx = touch.fingStart.x - t.pageX;
      const dy = touch.fingStart.y - t.pageY;
      touch.delta.x += dx * 0.0004;
      touch.delta.y += dy * 0.0004;
      touch.fingStart.x = t.pageX;
      touch.fingStart.y = t.pageY;
    }

    let hovered = null;
    function onClick() {
      if (hovered) setLightboxSrc(hovered.pool.item.sourceUrl);
    }

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    canvas.addEventListener("click", onClick);

    function isHovered(s) {
      const half = (size * s.ratio) / 2;
      return (
        s.displayed &&
        touch.mouse.x > s.x - half &&
        touch.mouse.x < s.x + half &&
        touch.mouse.y > s.y - half &&
        touch.mouse.y < s.y + half
      );
    }

    function render() {
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(width / 2, height / 2);

      hovered = null;

      for (const s of shapes) {
        s.x = Math.sin(s.xRadian + touch.delta.x) * radius;
        s.y = Math.cos(s.yRadian + touch.delta.y) * radius;

        const d = Math.sqrt(s.x * s.x + s.y * s.y) / radius;
        s.ratio = 1 - Math.min(ease(d), 1);

        if (Math.sin(s.yRadian + touch.delta.y) > 0 || Math.cos(s.xRadian + touch.delta.x) > 0) {
          s.displayed = false;
          continue;
        }
        s.displayed = true;

        const mediaEl = s.pool.el;
        const nw = s.pool.isVideo ? mediaEl.videoWidth : mediaEl.naturalWidth;
        const nh = s.pool.isVideo ? mediaEl.videoHeight : mediaEl.naturalHeight;

        if (s.pool.loaded && nw && nh) {
          const sw = Math.min(size, nw);
          const sh = Math.min(size, nh);

          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.scale(s.ratio, s.ratio);
          ctx.translate(-s.x, -s.y);
          ctx.globalAlpha = s.ratio;
          ctx.drawImage(
            mediaEl,
            nw / 2 - sw / 2, nh / 2 - sh / 2, sw, sh,
            s.x - size / 2, s.y - size / 2, size, size
          );
          ctx.restore();
        }

        if (isHovered(s)) hovered = s;
      }

      canvas.style.cursor = hovered ? "zoom-in" : "default";

      if (hovered) {
        const half = (size * hovered.ratio) / 2;
        ctx.save();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(hovered.x - half, hovered.y - half, half * 2, half * 2);
        ctx.restore();
      }

      ctx.restore();
      animationId = requestAnimationFrame(render);
    }

    render();
    requestAnimationFrame(() => canvas.classList.add("is-ready"));

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("click", onClick);
      pool.forEach((p) => p.el.remove());
    };
  }, [items]);

  return (
    <div className="archive-page" ref={pageRef}>
      <Link to="/" className="archive-nav-label">DOMENICA</Link>

      {items.length > 0 ? (
        <canvas ref={canvasRef} className="archive-canvas" />
      ) : (
        <p className="archive-empty">Nessun contenuto, per ora.</p>
      )}

      {lightboxSrc && (
        <div className="lightbox-overlay" onClick={() => setLightboxSrc(null)}>
          <button className="lightbox-close" onClick={() => setLightboxSrc(null)} aria-label="Chiudi">×</button>
          <img
            className="lightbox-img"
            src={lightboxSrc}
            alt=""
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
