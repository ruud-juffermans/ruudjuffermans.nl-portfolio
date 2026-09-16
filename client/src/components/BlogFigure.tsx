import { Box, Typography } from "@mui/material";
import { palette } from "@/theme/theme";

/**
 * An image inside a blog post.
 *
 * Markdown images in a post are diagrams: draw.io and Mermaid exports converted
 * to dark-only SVG (scripts/drawio-to-web.mjs), so they need the same navy card
 * the project pages give them, in both colour schemes. The markdown title
 * becomes the caption:
 *
 *     ![alt text](/images/blog/<slug>/<name>.svg "The caption.")
 *
 * A photo or screenshot without a title renders as a plain rounded image.
 */
export default function BlogFigure({
  src,
  alt,
  title,
}: {
  src?: string;
  alt?: string;
  title?: string;
}) {
  if (!src) return null;
  const isDiagram = src.endsWith(".svg");

  return (
    <Box component="figure" sx={{ m: 0, my: 4 }}>
      <Box
        component="img"
        src={src}
        alt={alt ?? ""}
        loading="lazy"
        decoding="async"
        sx={{
          display: "block",
          width: "100%",
          height: "auto",
          borderRadius: "12px",
          ...(isDiagram
            ? {
                backgroundColor: palette.navy,
                border: `1px solid ${palette.gray200}`,
                p: { xs: 1.5, md: 2.5 },
                boxSizing: "border-box",
              }
            : {}),
        }}
      />
      {title ? (
        <Typography
          component="figcaption"
          sx={{
            mt: 1.5,
            fontSize: "0.9rem",
            lineHeight: 1.55,
            color: "var(--app-text-muted)",
          }}
        >
          {title}
        </Typography>
      ) : null}
    </Box>
  );
}
