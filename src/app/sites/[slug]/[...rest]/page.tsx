import { notFound } from "next/navigation";

/** Any other path on a tenant subdomain (lina.getfolio.dev/anything) → the portfolio's own 404. */
export default function SiteUnknownPath() {
  notFound();
}
