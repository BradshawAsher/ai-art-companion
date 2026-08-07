import { createFileRoute } from "@tanstack/react-router";
import AtelierApp from "@/AtelierApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atelier — AI Art Teacher & Creative Coach" },
      {
        name: "description",
        content:
          "Upload your artwork and get warm, personalised AI critique, skill scoring, tokens, stickers and a growing portfolio.",
      },
      { property: "og:title", content: "Atelier — AI Art Teacher & Creative Coach" },
      {
        property: "og:description",
        content:
          "Upload your artwork and get warm, personalised AI critique, skill scoring, tokens, stickers and a growing portfolio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <AtelierApp />;
}
