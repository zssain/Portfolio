"use client";

import { useState, type ChangeEvent, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Send, Check, LoaderCircle, TriangleAlert } from "lucide-react";
import { C } from "../lib/data";
import { SectionLabel } from "./SectionLabel";
import { Reveal } from "./Reveal";
import { HOVER_TAP } from "../lib/motion";

type SendStatus = "idle" | "loading" | "success" | "error";

const LABEL_ANIM = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.2 },
  style: { display: "inline-flex", alignItems: "center", gap: 9 } as CSSProperties,
};

export function Contact() {
  const [fld, setFld] = useState({ name: "", email: "", subject: "", message: "" });
  const [company, setCompany] = useState(""); // honeypot — real users leave this empty
  const [status, setStatus] = useState<SendStatus>("idle");
  const [errMsg, setErrMsg] = useState("");
  const on = (k: keyof typeof fld) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFld((s) => ({ ...s, [k]: e.target.value }));

  // fallback: open the user's mail client with the message prefilled
  const openMailto = () => {
    const subject = encodeURIComponent(fld.subject || "Portfolio inquiry");
    const body = encodeURIComponent((fld.message || "") + "\n\n— " + (fld.name || "") + "\n" + (fld.email || ""));
    window.location.href = "mailto:mohammedzuhairhussain28@gmail.com?subject=" + subject + "&body=" + body;
  };

  const send = async () => {
    if (status === "loading" || status === "success") return;
    setStatus("loading");
    setErrMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fld, company }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Request failed");
      }
      setStatus("success");
      setFld({ name: "", email: "", subject: "", message: "" });
    } catch (e) {
      setStatus("error");
      setErrMsg(e instanceof Error ? e.message : "Something went wrong");
      openMailto(); // fallback so the message still gets through
    }
  };

  const Ln = ({ n }: { n: number }) => (<span style={{ color: C.faint, width: 20, display: "inline-block", textAlign: "right", marginRight: 16, userSelect: "none" }}>{n}</span>);
  const k: CSSProperties = { color: C.blue };
  const v: CSSProperties = { color: C.green };
  const pn: CSSProperties = { color: C.muted };
  const faint: CSSProperties = { color: C.faint };
  const jlines = [
    <span style={pn}>{"{"}</span>,
    <>{"  "}<span style={k}>"status"</span>: <span style={v}>"open_to_work"</span>,</>,
    <>{"  "}<span style={k}>"email"</span>: <span style={v}>"mohammedzuhairhussain28@gmail.com"</span>,</>,
    <>{"  "}<span style={k}>"socials"</span>: <span style={pn}>{"{"}</span></>,
    <>{"    "}<span style={k}>"github"</span>: <span style={v}>"@zssain"</span>,</>,
    <>{"    "}<span style={k}>"linkedin"</span>: <span style={v}>"@zuhairhussain28"</span></>,
    <>{"  "}<span style={pn}>{"}"}</span>,</>,
    <>{"  "}<span style={k}>"location"</span>: <span style={v}>"Hyderabad, India"</span>,</>,
    <>{"  "}<span style={k}>"graduation"</span>: <span style={v}>"August 2026"</span></>,
    <span style={pn}>{"}"}</span>,
    <>{"\u00A0"}</>,
    <span style={faint}>{"// waiting for connection ..."}</span>,
    <span className="zh-blink" style={{ color: C.accent }}>_</span>,
  ];

  return (
    <section id="contact" style={{ padding: "70px 0 20px" }}>
      <Reveal>
      <SectionLabel index="04">CONTACT</SectionLabel>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
        <Mail size={20} style={{ color: C.accent }} />
        <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(17px, 2.6vw, 24px)", color: C.text }}>
          $ ./contact<span style={{ color: C.muted }}>.exe</span>
        </span>
      </div>

      <div className="contact-grid">
        {/* left — contact_info.json */}
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", background: C.editor }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ width: 10, height: 10, borderRadius: 99, background: "#3a3f49" }} />
            <span style={{ width: 10, height: 10, borderRadius: 99, background: "#3a3f49" }} />
            <span style={{ width: 10, height: 10, borderRadius: 99, background: "#3a3f49" }} />
            <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono), monospace", fontSize: 12, color: C.muted }}>contact_info.json</span>
          </div>
          <pre style={{ margin: 0, padding: "16px 14px", fontFamily: "var(--font-mono), monospace", fontSize: 12.5, lineHeight: 1.9, color: C.text, overflowX: "auto" }}>
        {jlines.map((ln, i) => (<div key={i}><Ln n={i + 1} />{ln}</div>))}
          </pre>
        </div>

        {/* right — sendMessage.ts */}
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", background: C.editor }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, color: C.blue }}>TS</span>
            <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, color: C.text }}>sendMessage.ts</span>
            <span style={{ color: C.faint, fontSize: 14 }}>×</span>
          </div>
          <div style={{ padding: "18px 18px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Mail size={14} style={{ color: C.accent }} />
              <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 13, color: C.text }}>mail.compose</span>
              <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono), monospace", fontSize: 11, color: C.faint }}>secure channel</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 18, fontFamily: "var(--font-mono), monospace", fontSize: 11.5, color: C.muted }}>
              to: <span style={{ color: C.accent, marginLeft: 6 }}>mohammedzuhairhussain28@gmail.com</span>
              <span style={{ marginLeft: "auto", color: C.faint }}>response: within 24h</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }} className="contact-fields">
              <div>
                <label className="zh-flabel">NAME</label>
                <input className="zh-input" placeholder="Your name" value={fld.name} onChange={on("name")} />
              </div>
              <div>
                <label className="zh-flabel">EMAIL</label>
                <input className="zh-input" placeholder="you@email.com" value={fld.email} onChange={on("email")} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="zh-flabel">SUBJECT</label>
              <input className="zh-input" placeholder="Project inquiry / collaboration" value={fld.subject} onChange={on("subject")} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="zh-flabel">MESSAGE</label>
              <textarea className="zh-input" rows={5} placeholder="Tell me about your project, timeline, and goals ..." value={fld.message} onChange={on("message")} style={{ resize: "vertical" }} />
            </div>

            {/* honeypot — hidden from real users; bots that fill it are dropped */}
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
            />

            <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11, color: status === "error" ? "#c08a6a" : C.faint, marginBottom: 18 }}>
              {status === "success"
                ? "// message sent — I'll reply within 24h"
                : status === "error"
                ? `// ${errMsg || "send failed"} — opened your mail app as a fallback`
                : "// sends straight to my inbox"}
            </div>

            <motion.button
              {...HOVER_TAP}
              className="zh-send"
              onClick={send}
              disabled={status === "loading" || status === "success"}
              style={{ minWidth: 208, justifyContent: "center", cursor: status === "loading" ? "progress" : status === "success" ? "default" : "pointer" }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {status === "idle" && (
                  <motion.span key="idle" {...LABEL_ANIM}><Send size={15} /> SEND MESSAGE</motion.span>
                )}
                {status === "loading" && (
                  <motion.span key="loading" {...LABEL_ANIM}>
                    <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} style={{ display: "inline-flex" }}>
                      <LoaderCircle size={15} />
                    </motion.span>
                    SENDING…
                  </motion.span>
                )}
                {status === "success" && (
                  <motion.span key="success" {...LABEL_ANIM}><Check size={16} /> MESSAGE SENT</motion.span>
                )}
                {status === "error" && (
                  <motion.span key="error" {...LABEL_ANIM}><TriangleAlert size={15} /> RETRY</motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>
      </Reveal>
    </section>
  );
}
