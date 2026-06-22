import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:8000";
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET ?? "";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(
    `${API_BASE}/api/v1/sites?owner_email=${encodeURIComponent(session.user.email)}`,
    { headers: { "X-Internal-Secret": INTERNAL_SECRET }, cache: "no-store" },
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const res = await fetch(`${API_BASE}/api/v1/sites`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Internal-Secret": INTERNAL_SECRET },
    body: JSON.stringify({
      name: body.name,
      domain: body.domain,
      owner_email: session.user.email,
    }),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
