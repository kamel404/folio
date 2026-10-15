import { notFound } from "next/navigation";

/** Unknown /dashboard/* URLs render the dashboard 404 (with the sidebar) instead of the bare root 404. */
export default function DashboardCatchAll() {
  notFound();
}
