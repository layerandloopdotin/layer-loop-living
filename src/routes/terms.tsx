import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/policy";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Layer & Loop" },
      { name: "description", content: "The terms that apply to orders, pricing, delivery and use of the Layer & Loop website." },
      { property: "og:title", content: "Terms & Conditions — Layer & Loop" },
      { property: "og:description", content: "Terms for orders, pricing and delivery at Layer & Loop." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <PolicyPage which="terms" />,
});
