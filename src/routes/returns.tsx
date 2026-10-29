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
  component: () => (
    <PolicyPage
      eyebrow="Customer care"
      title="Returns, Replacements & Refunds"
      intro="We want every object to arrive as intended. Where something goes wrong, here is how we put it right — subject to the conditions below."
      sections={[
        { h: "Record your unboxing", body: <><p>Please record a continuous, unedited video while opening your parcel, starting with the sealed package and its shipping label in view.</p><p>Claims for damaged, missing or incorrect items can only be considered with this video. Report any issue within 48 hours of delivery.</p></> },
        { h: "Eligibility", body: <><p>Not every product is eligible for return at this time. Made-to-order, personalised, custom-colour and trade or bulk orders are non-returnable. Eligibility for each object will be stated on its product page.</p></> },
        { h: "Replacements", body: <p>Items verified as damaged in transit or carrying a manufacturing defect will be replaced at no cost. If a replacement is unavailable, we will offer a full refund or store credit.</p> },
        { h: "Returns", body: <p>Eligible items may be returned within 7 days of delivery, unused and in their original packaging. Return shipping may be charged unless the item was damaged or incorrect.</p> },
        { h: "Refunds", body: <p>Approved refunds are issued to the original payment method within 7–10 working days of the returned item passing inspection.</p> },
        { h: "Special cases", body: <p>All returns, replacements and refunds are assessed case by case and remain at the discretion of Layer &amp; Loop. Terms and conditions apply.</p> },
      ]}
    />
  ),
});
