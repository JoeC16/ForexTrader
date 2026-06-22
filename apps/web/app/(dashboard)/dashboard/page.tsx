import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardClient } from "./dashboard-client";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:8000";
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET ?? "";

interface ExistingSite {
  id: string;
  name: string;
  domain: string;
  api_key_prefix: string;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const email = session!.user!.email!;

  const res = await fetch(
    `${API_BASE}/api/v1/sites?owner_email=${encodeURIComponent(email)}`,
    { headers: { "X-Internal-Secret": INTERNAL_SECRET }, cache: "no-store" },
  );
  const sites: ExistingSite[] = res.ok ? await res.json() : [];

  return <DashboardClient email={email} initialSites={sites} />;
}
