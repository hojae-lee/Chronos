"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Wand2, ArrowUp, CalendarDays, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import { useCalendarAI } from "@/hooks/useCalendarAI";
import type { CalendarAICallbacks } from "@/hooks/useCalendarAI";
import type { Event } from "@/hooks/useEvents";

type Message = {
  id: number;
  role: "user" | "ai";
  text: string;
  events?: Event[];
  isRetro?: boolean;
  retroYear?: number;
  retroMonth?: number;
};

type Props = CalendarAICallbacks;

let _msgId = 0;

export default function NaturalLanguageInput(props: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { send, loading } = useCalendarAI(props);

  const focusInput = useCallback(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    if (open) focusInput();
  }, [open, focusInput]);

  // Re-focus after AI responds
  useEffect(() => {
    if (!loading) focusInput();
  }, [loading, focusInput]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend() {
    if (!text.trim() || loading) return;
    const value = text;
    setText("");

    const userMsg: Message = { id: ++_msgId, role: "user", text: value };
    const loadingMsg: Message = { id: ++_msgId, role: "ai", text: "" };
    setMessages((prev) => [...prev, userMsg, loadingMsg]);

    const result = await send(value);

    setMessages((prev) => {
      const without = prev.slice(0, -1);
      if (!result) return without;
      return [
        ...without,
        {
          id: ++_msgId,
          role: "ai",
          text: result.message,
          events: result.events,
          isRetro: result.isRetro,
          retroYear: result.retroYear,
          retroMonth: result.retroMonth,
        },
      ];
    });
  }

  return (
    <div className="fixed bottom-[76px] left-0 right-0 z-sticky px-4 pointer-events-none">
      <div className="max-w-2xl mx-auto pointer-events-auto">
        {/* Chat card */}
        {open && (
          <div className="bg-background-surface/95 backdrop-blur-sm rounded-2xl border border-border-default shadow-xl overflow-hidden mb-3 animate-fade-in">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-subtle">
              <span className="text-brand-primary text-xs font-bold">✦</span>
              <span className="text-xs font-semibold text-text-secondary">
                Chronos AI
              </span>
            </div>

            {/* Messages */}
            <div className="px-4 py-3 space-y-3 max-h-[28vh] overflow-y-auto">
              {messages.length === 0 && (
                <p className="text-xs text-text-disabled text-center py-6">
                  일정을 말로 추가하거나 물어보세요 ✦
                </p>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={[
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start",
                  ].join(" ")}
                >
                  {msg.role === "user" ? (
                    <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[88%]">
                      <p className="text-sm text-text-primary leading-relaxed">
                        {msg.text}
                      </p>
                    </div>
                  ) : msg.text === "" ? (
                    /* Thinking dots */
                    <div className="bg-background-elevated rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1.5 items-center h-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-text-disabled animate-[thinking-dot_1.2s_ease-in-out_infinite_0ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-text-disabled animate-[thinking-dot_1.2s_ease-in-out_infinite_200ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-text-disabled animate-[thinking-dot_1.2s_ease-in-out_infinite_400ms]" />
                      </div>
                    </div>
                  ) : msg.events && msg.events.length > 0 ? (
                    /* Event list */
                    <div className="bg-background-elevated rounded-2xl rounded-tl-sm overflow-hidden max-w-[88%]">
                      <p className="text-sm text-text-primary px-4 pt-3 pb-2 leading-relaxed">
                        {msg.text}
                      </p>
                      <ul className="pb-2">
                        {msg.events.map((e) => {
                          const dateLabel = format(
                            new Date(e.startAt),
                            "M월 d일 (E)",
                            { locale: ko },
                          );
                          const timeLabel = e.isAllDay
                            ? "종일"
                            : format(new Date(e.startAt), "HH:mm");
                          return (
                            <li key={e.id}>
                              <button
                                onClick={() => {
                                  props.onNavigateTo(new Date(e.startAt));
                                  props.onOpenEvent(e.id);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-background-surface transition-colors duration-150 text-left"
                              >
                                <div className="w-7 h-7 rounded-lg bg-brand-subtle flex items-center justify-center shrink-0">
                                  <CalendarDays
                                    size={13}
                                    className="text-brand-primary"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={[
                                      "text-xs font-medium text-text-primary truncate",
                                      e.status === "cancelled"
                                        ? "line-through opacity-50"
                                        : "",
                                    ].join(" ")}
                                  >
                                    {e.title}
                                  </p>
                                  <p className="text-[11px] text-text-disabled">
                                    {dateLabel} · {timeLabel}
                                  </p>
                                </div>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : msg.isRetro ? (
                    /* Retrospective trigger */
                    <div className="bg-background-elevated rounded-2xl rounded-tl-sm px-4 py-3 max-w-[88%]">
                      <p className="text-sm text-text-primary leading-relaxed mb-2">
                        {msg.text}
                      </p>
                      <button
                        onClick={() =>
                          props.onOpenRetrospective?.(
                            msg.retroYear!,
                            msg.retroMonth!,
                          )
                        }
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:text-brand-hover transition-colors duration-150"
                      >
                        <Sparkles size={12} />
                        회고록 보기
                      </button>
                    </div>
                  ) : (
                    /* Regular AI response — with markdown rendering */
                    <div className="bg-background-elevated rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[88%] text-sm text-text-primary leading-relaxed">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => (
                            <p className="mb-1.5 last:mb-0">{children}</p>
                          ),
                          strong: ({ children }) => (
                            <strong className="text-brand-primary font-semibold">
                              {children}
                            </strong>
                          ),
                          em: ({ children }) => (
                            <em className="not-italic text-text-secondary">
                              {children}
                            </em>
                          ),
                          ul: ({ children }) => (
                            <ul className="space-y-1 my-1.5">{children}</ul>
                          ),
                          li: ({ children }) => (
                            <li className="flex items-start gap-2">
                              <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                              <span>{children}</span>
                            </li>
                          ),
                          h1: ({ children }) => (
                            <p className="font-bold text-text-primary mb-1">
                              {children}
                            </p>
                          ),
                          h2: ({ children }) => (
                            <p className="font-bold text-text-primary mb-1">
                              {children}
                            </p>
                          ),
                          h3: ({ children }) => (
                            <p className="font-semibold text-text-primary mb-0.5">
                              {children}
                            </p>
                          ),
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border-subtle px-4 py-2.5 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                autoComplete="off"
                value={text}
                disabled={loading}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
                placeholder="일정을 말해보세요..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-disabled min-w-0"
              />
              <button
                onClick={handleSend}
                disabled={!text.trim() || loading}
                className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-primary text-white hover:bg-brand-hover transition-colors duration-150 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowUp size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Floating toggle button */}
        <div className="flex justify-end">
          <button
            onClick={() => setOpen((v) => !v)}
            className={[
              "flex items-center justify-center w-11 h-11 rounded-full shadow-lg border transition-all duration-200",
              open
                ? "bg-brand-primary border-brand-primary text-white"
                : "bg-background-surface border-border-subtle text-brand-primary hover:border-brand-primary/40",
            ].join(" ")}
            aria-label="AI 어시스턴트"
          >
            <Wand2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
