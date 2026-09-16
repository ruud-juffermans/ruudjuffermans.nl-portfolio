/**
 * Renders a schema.org JSON-LD block. Server component — keep the data
 * serializable. The `<` escape prevents `</script>` injection via content.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
