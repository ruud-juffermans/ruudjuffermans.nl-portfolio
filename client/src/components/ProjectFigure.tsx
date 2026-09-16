import { Box, Typography } from "@mui/material";
import Image from "next/image";
import DrawioViewer from "@/components/DrawioViewer";
import { palette } from "@/theme/theme";

export interface ProjectFigureProps {
  kind: "diagram" | "screenshot";
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  /** Diagrams only: .drawio source to render in draw.io's zoomable viewer. */
  drawioSrc?: string;
  /** `sizes` hint for the screenshot image (defaults to the content column). */
  sizes?: string;
  priority?: boolean;
}

/**
 * A diagram or screenshot with a caption, for the bespoke project pages.
 *
 * Diagrams are draw.io exports converted to dark-only SVG (see
 * scripts/drawio-to-web.mjs), so
 * they sit on navy in both colour schemes — the same treatment as code
 * blocks. Nothing in a figure is clickable: the diagrams carry no links, and
 * the architecture ones are explored in place with the draw.io viewer.
 * Screenshots go
 * through next/image so the PNGs are served optimised and sized.
 */
export default function ProjectFigure({
  kind,
  src,
  width,
  height,
  alt,
  caption,
  drawioSrc,
  sizes = "(min-width: 1200px) 1152px, 100vw",
  priority = false,
}: ProjectFigureProps) {
  const frame = {
    display: "block",
    width: "100%",
    height: "auto",
    borderRadius: "16px",
    border: `1px solid ${palette.gray200}`,
    boxShadow: "0 2px 12px rgba(11, 17, 32, 0.06)",
  } as const;

  return (
    <Box component="figure" sx={{ m: 0 }}>
      {kind === "diagram" && drawioSrc ? (
        <DrawioViewer
          src={drawioSrc}
          fallbackSrc={src}
          width={width}
          height={height}
          alt={alt}
          priority={priority}
        />
      ) : kind === "diagram" ? (
        <Box
          component="img"
          src={src}
          width={width}
          height={height}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          sx={{
            ...frame,
            backgroundColor: palette.navy,
            p: { xs: 1.5, md: 2.5 },
            boxSizing: "border-box",
          }}
        />
      ) : (
        <Image
          src={src}
          width={width}
          height={height}
          alt={alt}
          sizes={sizes}
          priority={priority}
          style={frame}
        />
      )}
      <Typography
        component="figcaption"
        sx={{ mt: 1.5, fontSize: "0.9rem", lineHeight: 1.55, color: "var(--app-text-muted)" }}
      >
        {caption}
      </Typography>
    </Box>
  );
}
