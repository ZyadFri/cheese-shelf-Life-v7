"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Bot,
  Loader2,
  MessageCircleQuestion,
  Send,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
} from "lucide-react";

import { api, type AssistantChatMessage } from "@/lib/api";

const EASE = [0.16, 1, 0.3, 1] as const;

interface GuideContext {
  classNames: string[];
  lowMaxPct: number;
  mediumMaxPct: number;
  treatedFormulations: number;
  bestClassifier: string;
  testAccuracy: number | null;
}

type GuideMessage = {
  role: "user" | "assistant";
  content: string;
  error?: boolean;
};

const QUICK_QUESTIONS = [
  "How is classification different from prediction?",
  "Why is classification special?",
  "What do Low, Medium and High mean?",
  "When should I use classification?",
];

export function ClassificationAIGuide({ context }: { context: GuideContext }) {
  const reduce = useReducedMotion();
  const [messages, setMessages] = React.useState<GuideMessage[]>([
    {
      role: "assistant",
      content:
        "Hi, I’m Shelf-Life AI. I can explain why this Classification workspace exists, how it differs from Prediction, and when each tool is the better choice.",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [voiceEnabled, setVoiceEnabled] = React.useState(false);
  const [speaking, setSpeaking] = React.useState(false);
  const transcriptRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [messages, loading, reduce]);

  React.useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function speak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.96;
    utterance.pitch = 1.02;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }

  async function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    const nextMessages: GuideMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const history: AssistantChatMessage[] = nextMessages.map((message) => ({
        role: message.role,
        content: message.content,
      }));

      const response = await api.assistantChat({
        messages: history,
        page_context: {
          current_page: "/app/classification",
          assistant_surface: "classification_embedded_guide",
          response_style: "Explain clearly in 2 to 5 concise sentences. Focus on the distinction between formulation efficacy classification and numerical shelf-life prediction. Never invent metrics or scientific values.",
          classification_context: {
            class_names: context.classNames,
            thresholds_pct: {
              low_max: context.lowMaxPct,
              medium_max: context.mediumMaxPct,
            },
            treated_formulations: context.treatedFormulations,
            best_classifier: context.bestClassifier,
            test_accuracy: context.testAccuracy,
            important_semantics: [
              "Classification assigns the full formulation to a relative efficacy tier learned from matched-control improvement patterns in the training data.",
              "Prediction estimates a numerical shelf-life outcome for a configured cheese context and endpoint.",
              "Classification is not a shelf-life estimate and its Low/Medium/High tiers are dataset-relative, not regulatory thresholds.",
            ],
          },
        },
      });

      const assistantMessage: GuideMessage = { role: "assistant", content: response.reply };
      setMessages((previous) => [...previous, assistantMessage]);
      if (voiceEnabled) speak(response.reply);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? `I couldn’t reach the Shelf-Life AI service: ${error.message}`
              : "I couldn’t reach the Shelf-Life AI service right now.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const latestAssistant = [...messages].reverse().find((message) => message.role === "assistant" && !message.error);
  const classLabel = context.classNames.join(" / ");

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="relative mb-8 overflow-hidden rounded-[24px] border border-[#ebd8de] bg-[linear-gradient(125deg,#fff6f8_0%,#fffafb_45%,#fff8f5_100%)] shadow-[0_24px_60px_-46px_rgba(100,26,48,.48)]"
    >
      <GuideAtmosphere />

      <div className="relative grid gap-5 p-5 lg:grid-cols-[220px_minmax(0,1fr)_minmax(400px,1.12fr)] lg:p-6">
        <div className="relative flex min-h-[235px] items-center justify-center lg:min-h-[260px]">
          <div className="absolute left-0 top-0 inline-flex items-center gap-1.5 rounded-full border border-[#ead6dc] bg-white/75 px-3 py-1 text-[10px] font-semibold text-[#8b2945] shadow-sm backdrop-blur">
            <Sparkles className="size-3" /> Ask Shelf-Life AI
          </div>
          <RobotGuide speaking={speaking} />
        </div>

        <div className="flex min-w-0 flex-col justify-center">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#a04660]">Your AI guide</p>
              <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.025em] text-[#402d34]">Why this workspace is different</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                if (speaking) {
                  stopSpeaking();
                  return;
                }
                setVoiceEnabled((value) => !value);
                if (!voiceEnabled && latestAssistant) speak(latestAssistant.content);
              }}
              className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#e7d5db] bg-white/80 text-[#8b2945] transition-colors hover:bg-white"
              aria-label={speaking ? "Stop speaking" : voiceEnabled ? "Disable spoken answers" : "Enable spoken answers"}
              title={speaking ? "Stop speaking" : voiceEnabled ? "Spoken answers on" : "Read answers aloud"}
            >
              {speaking ? <Square className="size-3" fill="currentColor" /> : voiceEnabled ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
            </button>
          </div>

          <div
            ref={transcriptRef}
            className="max-h-[150px] min-h-[118px] space-y-2 overflow-y-auto pr-1 [scrollbar-width:thin]"
            aria-live="polite"
          >
            {messages.slice(-4).map((message, index) => (
              <motion.div
                key={`${message.role}-${index}-${message.content.slice(0, 20)}`}
                initial={reduce ? false : { opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    message.role === "user"
                      ? "max-w-[92%] rounded-[16px_16px_5px_16px] border border-[#ead6dc] bg-[#f6e6eb] px-3.5 py-2.5 text-[11px] leading-[1.5] text-[#663246]"
                      : message.error
                        ? "max-w-[96%] rounded-[16px_16px_16px_5px] border border-[#efcfd6] bg-[#fff1f3] px-3.5 py-2.5 text-[11px] leading-[1.5] text-[#9b2944]"
                        : "max-w-[96%] rounded-[16px_16px_16px_5px] border border-white bg-white/85 px-3.5 py-2.5 text-[11px] leading-[1.55] text-[#514047] shadow-[0_10px_24px_-20px_rgba(85,31,48,.5)]"
                  }
                >
                  {message.content}
                </div>
              </motion.div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-[14px] border border-white bg-white/80 px-3 py-2 text-[10px] text-[#8c747d]">
                  <Loader2 className="size-3 animate-spin" /> Thinking…
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {QUICK_QUESTIONS.slice(0, 3).map((question) => (
              <button
                type="button"
                key={question}
                onClick={() => ask(question)}
                disabled={loading}
                className="rounded-full border border-[#e8d8dd] bg-white/70 px-2.5 py-1 text-[9px] font-medium text-[#7b4658] transition-all hover:-translate-y-0.5 hover:border-[#cf9cab] hover:bg-white disabled:opacity-50"
              >
                {question}
              </button>
            ))}
          </div>

          <form
            className="mt-3 flex items-center gap-2 rounded-[14px] border border-[#e5d3d9] bg-white/82 p-1.5 shadow-[0_10px_26px_-24px_rgba(75,27,42,.5)]"
            onSubmit={(event) => {
              event.preventDefault();
              ask(input);
            }}
          >
            <MessageCircleQuestion className="ml-2 size-3.5 shrink-0 text-[#a34b64]" />
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask why, when, or how…"
              className="min-w-0 flex-1 bg-transparent px-1 py-1.5 text-[11px] text-[#4d3a41] outline-none placeholder:text-[#ac959d]"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-[#8d1838] text-white transition-all hover:bg-[#76142f] disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Ask Shelf-Life AI"
            >
              {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
            </button>
          </form>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
          <ConceptCard
            eyebrow="Classification"
            title="Prioritize formulations"
            body={`Assigns the complete formulation to a relative ${classLabel} efficacy tier learned from the training dataset.`}
            footer="Best for screening and comparing candidates."
            tone="classification"
          />
          <ConceptCard
            eyebrow="Prediction"
            title="Estimate shelf life"
            body="Estimates a numerical shelf-life outcome for one configured cheese, endpoint, storage condition and treatment context."
            footer="Best when you need a number for a specific case."
            tone="prediction"
          />
          <div className="sm:col-span-2 rounded-[17px] border border-[#ead7dd] bg-white/68 px-4 py-3 backdrop-blur">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#f7e3e9] text-[#9b2748]">
                <Sparkles className="size-3" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-[#832542]">Why Classification is special</p>
                <p className="mt-1 text-[10px] leading-[1.55] text-[#725c64]">
                  It judges the <span className="font-semibold text-[#583842]">full formulation pattern</span>, not an ingredient in isolation, and gives you a fast efficacy tier without requiring a separate control input when you classify a new formulation.
                </p>
              </div>
              <ArrowUpRight className="ml-auto size-3.5 shrink-0 text-[#b26178]" />
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function ConceptCard({
  eyebrow,
  title,
  body,
  footer,
  tone,
}: {
  eyebrow: string;
  title: string;
  body: string;
  footer: string;
  tone: "classification" | "prediction";
}) {
  const primary = tone === "classification";
  return (
    <div className={`relative overflow-hidden rounded-[18px] border p-4 ${primary ? "border-[#ebcfd7] bg-[linear-gradient(150deg,#fff,#fff4f7)]" : "border-[#dfe3ef] bg-[linear-gradient(150deg,#fff,#f7f8ff)]"}`}>
      <div className={`mb-3 flex size-8 items-center justify-center rounded-full ${primary ? "bg-[#f7e1e8] text-[#9b2446]" : "bg-[#e9eefb] text-[#4569a4]"}`}>
        {primary ? <Bot className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}
      </div>
      <p className={`text-[9px] font-semibold uppercase tracking-[0.08em] ${primary ? "text-[#9a3a57]" : "text-[#5472a0]"}`}>{eyebrow}</p>
      <h3 className="mt-1 text-[14px] font-semibold tracking-[-0.02em] text-[#3f3036]">{title}</h3>
      <p className="mt-2 text-[10px] leading-[1.55] text-[#74636a]">{body}</p>
      <p className="mt-3 border-t border-black/5 pt-2 text-[9px] font-medium text-[#86727a]">{footer}</p>
    </div>
  );
}

function RobotGuide({ speaking }: { speaking: boolean }) {
  return (
    <motion.div
      animate={speaking ? { y: [0, -3, 0], rotate: [0, -1, 1, 0] } : { y: [0, -2, 0] }}
      transition={{ duration: speaking ? 1.2 : 3.4, repeat: Infinity, ease: "easeInOut" }}
      className="relative mt-7 h-[190px] w-[170px]"
      aria-hidden
    >
      <div className="absolute left-1/2 top-[12px] h-[74px] w-[108px] -translate-x-1/2 rounded-[44%_44%_40%_40%] border border-[#dfc4cc] bg-[linear-gradient(145deg,#fff,#f2e7ea)] shadow-[0_18px_28px_-20px_rgba(82,25,44,.65)]">
        <div className="absolute inset-x-[13px] top-[14px] h-[43px] rounded-[20px] border border-[#372a31] bg-[radial-gradient(circle_at_50%_30%,#3e2c35,#171319_72%)] shadow-inner">
          <motion.span
            animate={speaking ? { scaleY: [1, 0.55, 1] } : { opacity: [1, 0.72, 1] }}
            transition={{ duration: speaking ? 0.35 : 2.5, repeat: Infinity }}
            className="absolute left-[18px] top-[15px] h-[9px] w-[7px] rounded-full bg-[#ff86a6] shadow-[0_0_9px_#ff6d94]"
          />
          <motion.span
            animate={speaking ? { scaleY: [1, 0.55, 1] } : { opacity: [1, 0.72, 1] }}
            transition={{ duration: speaking ? 0.35 : 2.5, repeat: Infinity, delay: 0.08 }}
            className="absolute right-[18px] top-[15px] h-[9px] w-[7px] rounded-full bg-[#ff86a6] shadow-[0_0_9px_#ff6d94]"
          />
          <motion.div
            animate={speaking ? { width: [18, 25, 15, 22], borderRadius: [8, 4, 8, 5] } : { width: 20 }}
            transition={{ duration: 0.45, repeat: speaking ? Infinity : 0 }}
            className="absolute bottom-[8px] left-1/2 h-[3px] -translate-x-1/2 bg-[#ff89a7] shadow-[0_0_7px_#ff7299]"
          />
        </div>
        <div className="absolute -left-[10px] top-[22px] h-[31px] w-[15px] rounded-l-full border border-[#d7bcc5] bg-[#f6e9ed]" />
        <div className="absolute -right-[10px] top-[22px] h-[31px] w-[15px] rounded-r-full border border-[#d7bcc5] bg-[#f6e9ed]" />
        <div className="absolute left-1/2 top-[-13px] h-[18px] w-[2px] -translate-x-1/2 bg-[#c49aa8]">
          <div className="absolute -left-[4px] -top-[5px] size-[10px] rounded-full bg-[#9d2b4b] shadow-[0_0_10px_rgba(157,43,75,.38)]" />
        </div>
      </div>

      <div className="absolute left-1/2 top-[79px] h-[89px] w-[94px] -translate-x-1/2 rounded-[38px_38px_30px_30px] border border-[#dec4cc] bg-[linear-gradient(160deg,#fff,#f1e3e8)] shadow-[0_22px_30px_-24px_rgba(85,27,46,.62)]">
        <div className="absolute left-1/2 top-[20px] flex h-[31px] w-[28px] -translate-x-1/2 items-center justify-center rounded-[8px] border border-[#ebd2d9] bg-white shadow-inner">
          <McGillShieldMark />
        </div>
        <div className="absolute left-[13px] bottom-[13px] h-[8px] w-[28px] rounded-full bg-[#f5d7df]" />
        <div className="absolute right-[13px] bottom-[13px] h-[8px] w-[28px] rounded-full bg-[#f5d7df]" />
      </div>

      <motion.div
        animate={speaking ? { rotate: [18, 5, 18] } : { rotate: [15, 10, 15] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[9px] top-[94px] h-[18px] w-[57px] origin-right rounded-full border border-[#d9bdc6] bg-[linear-gradient(90deg,#f1e0e5,#fff)]"
      >
        <div className="absolute -left-[10px] -top-[2px] size-[21px] rounded-full border border-[#d9bdc6] bg-[#f7e9ed]" />
      </motion.div>

      <motion.div
        animate={speaking ? { rotate: [-35, -19, -35] } : { rotate: [-31, -25, -31] }}
        transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[5px] top-[93px] h-[18px] w-[60px] origin-left rounded-full border border-[#d9bdc6] bg-[linear-gradient(90deg,#fff,#f1e0e5)]"
      >
        <div className="absolute -right-[10px] -top-[2px] size-[21px] rounded-full border border-[#d9bdc6] bg-[#f7e9ed]" />
      </motion.div>

      <div className="absolute bottom-[2px] left-1/2 h-[16px] w-[124px] -translate-x-1/2 rounded-[50%] bg-[#dbaaba]/30 blur-[7px]" />
      <motion.div
        animate={{ scale: speaking ? [1, 1.05, 1] : [1, 1.025, 1] }}
        transition={{ duration: speaking ? 0.75 : 2.8, repeat: Infinity }}
        className="absolute left-1/2 top-[97px] size-[145px] -translate-x-1/2 rounded-full border border-[#e9ccd5]/65"
      />
    </motion.div>
  );
}

function McGillShieldMark() {
  return (
    <svg viewBox="0 0 24 28" className="h-5 w-4" fill="none">
      <path d="M3 2h18v10c0 7.1-3.8 11.5-9 14-5.2-2.5-9-6.9-9-14V2Z" fill="#d9293f" />
      <path d="M5.4 5.5h13.2v4.2H5.4V5.5Z" fill="white" />
      <path d="M7.1 7.6h9.8M8.2 5.5v4.2M12 5.5v4.2M15.8 5.5v4.2" stroke="#d9293f" strokeWidth="1" />
      <path d="m7.1 14.7 2-2 2 2 2-2 2 2 2-2v5.5c-1.4 2.5-3 4.1-5.1 5.3-2.1-1.2-3.7-2.8-4.9-5.3v-3.5Z" fill="white" />
      <path d="M8.5 18.2h7M10 15.8v5M14 15.8v5" stroke="#d9293f" strokeWidth=".9" />
    </svg>
  );
}
