import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const TO = process.env.CONTACT_TO || "mohammedzuhairhussain28@gmail.com";
// Resend requires a verified domain; "onboarding@resend.dev" works for testing
// (delivers to your own account email). Override with a verified address in prod.
const FROM = process.env.CONTACT_FROM || "Portfolio Contact <onboarding@resend.dev>";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ---- basic in-memory rate limiting (per IP) ----
   Best-effort: resets on cold start and isn't shared across serverless
   instances, but enough to blunt casual abuse. */
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_HITS = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_HITS;
}

function clamp(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Honeypot: real users never fill this. Pretend success so bots get no signal.
  if (clamp(body.company, 200)) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many messages. Please try again later." },
      { status: 429 },
    );
  }

  const name = clamp(body.name, 100);
  const email = clamp(body.email, 200);
  const subject = clamp(body.subject, 200) || "Portfolio inquiry";
  const message = clamp(body.message, 5000);

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 },
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Misconfigured server — let the client fall back to mailto.
    return NextResponse.json(
      { error: "Email service is not configured." },
      { status: 503 },
    );
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM,
      to: TO,
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      text:
        `New message from your portfolio contact form\n\n` +
        `Name:    ${name}\n` +
        `Email:   ${email}\n` +
        `Subject: ${subject}\n\n` +
        `${message}\n`,
    });
    if (error) {
      return NextResponse.json({ error: "Could not send message." }, { status: 502 });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Could not send message." }, { status: 502 });
  }
}
