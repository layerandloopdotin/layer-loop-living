import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/policy";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns, Replacements & Refunds — Layer & Loop" },
      { name: "description", content: "How returns, replacements and refunds work at Layer & Loop, including the unboxing video requirement for damage claims." },
      { property: "og:title", content: "Returns, Replacements & Refunds — Layer & Loop" },
      { property: "og:description", content: "Our policy on returns, replacements and refunds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <PolicyPage which="returns" />,
});
