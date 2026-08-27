"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Database,
  FlaskConical,
  Lightbulb,
  Loader2,
  Send,
  Sparkles,
  Tags,
  Wrench,
} from "lucide-react";

import {
  api,
  type AssistantChatMessage,
  type AssistantHealth,
  type AssistantRequestMeta,
  type AssistantToolCall,
} from "@/lib/api";

type ProjectContext = {
  totalRows: number;
  syntheticRows: number;
  paperDerivedRows: number;
  contexts: number;
  modelLabels: string[];
};

type DisplayMessage = {
  role: "user" | "assistant";
  content: string;
  toolCalls?: AssistantToolCall[];
  meta?: AssistantRequestMeta;
  error?: boolean;
};

const STARTERS = [
  {
    icon: Database,
    title: "Explain the dataset",
    prompt: "Explain the current Shelf-Life Studio dataset, its structure, provenance, and how it is used by the project.",
  },
  {
    icon: FlaskConical,
    title: "Prediction workflow",
    prompt: "Walk me through the complete shelf-life prediction workflow from user inputs to the final result.",
  },
  {
    icon: Tags,
    title: "Prediction vs classification",
    prompt: "Explain the difference between shelf-life prediction, formulation classification, and ingredient efficacy ranking in this project.",
  },
  {
    icon: Lightbulb,
    title: "Explainability",
    prompt: "Explain how global and local explainability work in Shelf-Life Studio and how a researcher should interpret them.",
  },
] as const;

function providerLabel(health: AssistantHealth | null) {
  if (!health) return "AI service";
  const provider = health.provider.charAt(0).toUpperCase() + health.provider.slice(1);
  return `${provider} · connected`;
}

function metaLabel(meta?: AssistantRequestMeta) {
  if (!meta) return null;
  if (meta.routed !== "llm") return meta.routed.replace(/_/g, " ");
  return `${meta.provider} · ${Math.round(meta.duration_ms)} ms`;
}

export function ProjectGuideChat({ context }: { context: ProjectContext }) {
  const [messages, setMessages] = React.useState<DisplayMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [health, setHealth] = React.useState<AssistantHealth | null>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    api.assistantHealth().then(setHealth).catch(() => setHealth(null));
  }, []);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  async function send(raw: string) {
    const text = raw.trim();
    if (!text || loading) return;

    const nextMessages: DisplayMessage[] = [...messages, { role: "user", content: text }];
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
          current_page: "/app/project-guide",
          assistant_surface: "full_project_guide",
          response_style:
            "Act as the Shelf-Life Studio research guide. Explain the project carefully and technically when useful, but remain clear. Ground project-specific claims in the supplied project context or available tools. Never invent scientific values, performance metrics, dataset counts, model results, references, or implementation details. If something is unavailable, say so explicitly.",
          project_context: {
            dataset: {
              total_rows: context.totalRows,
              synthetic_rows: context.syntheticRows,
              paper_derived_rows: context.paperDerivedRows,
              contexts: context.contexts,
            },
            loaded_model_families: context.modelLabels,
            product_modules: [
              "data workspace",
              "modeling",
              "prediction",
              "explainability",
              "formulation efficacy classification",
              "ingredient efficacy ranking",
            ],
          },
        },
      });

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: response.reply,
          toolCalls: response.tool_calls,
          meta: response.meta,
        },
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: error instanceof Error
            ? `I couldn't reach the project-guide backend: ${error.message}`
            : "I couldn't reach the project-guide backend right now.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col bg-[radial-gradient(circle_at_50%_0%,#fff7f8_0%,#fff_35%,#fff_100%)]">
      <header className="border-b border-[#ece2e5] bg-white/82 px-5 py-3 backdrop-blur-xl sm:px-7">
        <div className="mx-auto flex max-w-[980px] items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/app/how-it-works"
              className="flex size-9 items-center justify-center rounded-full border border-[#e8dde0] bg-white text-[#79545f] transition hover:border-[#d5b8c1] hover:bg-[#fff8fa]"
              aria-label="Back to How it works"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Bot className="size-4 text-[#951f40]" />
                <h1 className="text-[15px] font-semibold text-[#35292e]">Shelf-Life Studio Project Guide</h1>
              </div>
              <p className="mt-0.5 text-[10px] text-[#918188]">Ask about the science, data, models, workflow, or application design.</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-[10px] text-[#8c7d83] sm:flex">
            <span className={`size-2 rounded-full ${health ? "bg-emerald-500" : "bg-amber-400"}`} />
            {providerLabel(health)}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[900px] flex-1 flex-col px-4 sm:px-7">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
            <div className="relative flex size-16 items-center justify-center rounded-[22px] border border-[#ead8de] bg-[linear-gradient(145deg,#fff,#f8e9ee)] shadow-[0_18px_40px_-28px_rgba(114,28,56,.48)]">
              <Sparkles className="size-6 text-[#9b2144]" />
              <span className="absolute -right-1 -top-1 size-4 rounded-full border-2 border-white bg-emerald-500" />
            </div>
            <h2 className="mt-5 font-serif text-[32px] tracking-[-0.035em] text-[#31262b]">What would you like to understand?</h2>
            <p className="mt-2 max-w-[58ch] text-[12px] leading-5 text-[#82747a]">
              This guide uses the existing Shelf-Life AI backend with the current project manifest and model inventory as context.
            </p>

            <div className="mt-7 grid w-full gap-3 sm:grid-cols-2">
              {STARTERS.map((starter) => (
                <button
                  key={starter.title}
                  type="button"
                  onClick={() => send(starter.prompt)}
                  className="group rounded-[16px] border border-[#e8dde1] bg-white p-4 text-left shadow-[0_16px_36px_-32px_rgba(76,26,43,.38)] transition-all hover:-translate-y-0.5 hover:border-[#d6b9c2] hover:bg-[#fffafb]"
                >
                  <div className="flex size-8 items-center justify-center rounded-[10px] bg-[#f8e8ed] text-[#992144]">
                    <starter.icon className="size-4" />
                  </div>
                  <p className="mt-3 text-[12px] font-semibold text-[#43343a]">{starter.title}</p>
                  <p className="mt-1 text-[10px] leading-[1.5] text-[#887980]">{starter.prompt}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 py-7">
            <div className="space-y-6">
              {messages.map((message, index) => (
                <GuideMessage key={`${message.role}-${index}`} message={message} />
              ))}
              {loading && (
                <div className="flex items-start gap-3">
                  <AssistantAvatar />
                  <div className="flex items-center gap-2 rounded-[14px] border border-[#eee4e7] bg-white px-4 py-3 text-[11px] text-[#8b7d82] shadow-sm">
                    <Loader2 className="size-3.5 animate-spin" />
                    Thinking through the project…
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>
        )}

        <div className="sticky bottom-0 mt-auto bg-[linear-gradient(180deg,rgba(255,255,255,0),#fff_24%)] pb-5 pt-8">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              send(input);
            }}
            className="rounded-[20px] border border-[#ded1d6] bg-white p-2 shadow-[0_24px_65px_-34px_rgba(76,24,42,.44)]"
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send(input);
                }
              }}
              rows={2}
              placeholder="Ask anything about Shelf-Life Studio…"
              className="max-h-40 min-h-[58px] w-full resize-none bg-transparent px-3 py-2 text-[13px] leading-5 text-[#3d3035] outline-none placeholder:text-[#a7989e]"
            />
            <div className="flex items-center justify-between gap-3 px-2 pb-1">
              <p className="text-[9px] text-[#a09297]">Project-specific answers are grounded in available application context and tools.</p>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#8d1838] text-white shadow-[0_10px_24px_-14px_rgba(126,20,47,.7)] transition hover:bg-[#74132e] disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Send message"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

function AssistantAvatar() {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-[10px] border border-[#ead9de] bg-[#f9e9ee] text-[#9a2144]">
      <Sparkles className="size-3.5" />
    </div>
  );
}

function GuideMessage({ message }: { message: DisplayMessage }) {
  const user = message.role === "user";
  const meta = metaLabel(message.meta);

  if (user) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%] whitespace-pre-wrap rounded-[18px_18px_5px_18px] bg-[#8d1838] px-4 py-3 text-[12px] leading-[1.6] text-white shadow-[0_14px_30px_-22px_rgba(127,21,47,.72)]">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <AssistantAvatar />
      <div className="min-w-0 max-w-[84%]">
        <div className={message.error
          ? "whitespace-pre-wrap rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-[12px] leading-[1.68] text-red-700"
          : "whitespace-pre-wrap text-[13px] leading-[1.72] text-[#46393e]"
        }>
          {message.content}
        </div>
        {!message.error && (meta || (message.toolCalls && message.toolCalls.length > 0)) && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[9px] text-[#9a8c91]">
            {meta && <span>{meta}</span>}
            {message.toolCalls?.map((call, index) => (
              <span key={`${call.name}-${index}`} className="inline-flex items-center gap-1 rounded-full border border-[#e8dfe2] bg-[#fbf9fa] px-2 py-0.5">
                <Wrench className="size-2.5" /> {call.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
