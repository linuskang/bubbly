import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function logToSeqEdge(event: Record<string, any>) {
  try {
    await fetch(`${process.env.SEQ_URL}/ingest/clef`, {
      method: "POST",
      headers: { "Content-Type": "application/vnd.serilog.clef" },
      body: JSON.stringify(event),
    });
  } catch (err) {
    console.error("Seq logging failed:", err);
  }
}

export async function middleware(req: NextRequest) {
  const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const url = new URL(req.url);

  const title = `[${req.method}] ${url.pathname} from ${ip}`;

  logToSeqEdge({
    "@t": new Date().toISOString(),
    "@mt": title,
    Method: req.method,
    Url: req.url,
    Ip: ip,
    Protocol: url.protocol.replace(":", ""),
    Hostname: url.hostname,
    Pathname: url.pathname,
    Query: Object.fromEntries(url.searchParams.entries()),
    Referrer: req.headers.get("referer") || "unknown",
    UserAgent: req.headers.get("user-agent") || "unknown",
    Cookies: req.headers.get("cookie") || "",
    Accept: req.headers.get("accept"),
    AcceptEncoding: req.headers.get("accept-encoding"),
    AcceptLanguage: req.headers.get("accept-language"),
    CF_IpCountry: req.headers.get("cf-ipcountry"),
    CF_Ray: req.headers.get("cf-ray"),
    X_Forwarded_Host: req.headers.get("x-forwarded-host"),
    X_Forwarded_Proto: req.headers.get("x-forwarded-proto"),
  });

  return NextResponse.next();
}

export const config = { matcher: "/:path*" };