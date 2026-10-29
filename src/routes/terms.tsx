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
  component: () => (
    <PolicyPage
      eyebrow="Legal"
      title="Terms & Conditions"
      intro="The terms that apply when you browse this website or place an order with Layer & Loop Objects."
      sections={[
        { h: "Our products", body: <p>Every object is 3D printed and finished by hand. Fine layer lines, slight variations in texture and minor differences in colour between screen and product are characteristic of the process and are not considered defects.</p> },
        { h: "Orders & pricing", body: <p>All prices are listed in Indian Rupees and include applicable taxes. An order is confirmed only once payment is received. We reserve the right to cancel and fully refund any order affected by a pricing error or stock limitation.</p> },
        { h: "Delivery", body: <p>Delivery timelines shown at checkout are estimates and may vary by PIN code, courier availability and made-to-order lead times.</p> },
        { h: "Returns & refunds", body: <p>Returns, replacements and refunds are governed by our Returns, Replacements &amp; Refunds Policy, which forms part of these terms.</p> },
        { h: "Intellectual property", body: <p>All designs, photographs and content on this website belong to Layer &amp; Loop Objects and may not be reproduced, printed or resold without written permission.</p> },
        { h: "Governing law", body: <p>These terms are governed by the laws of India, with jurisdiction in the courts of Mumbai.</p> },
      ]}
    />
  ),
});
