"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Sparkles } from "lucide-react";
import { Button, ScrollShadow } from "@heroui/react";
import { usePathname, useRouter } from "next/navigation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_PROMPTS = [
  "Show my favorited recipes",
  "How do I upgrade to premium?",
  "Give me dinner ideas",
  "I want to add a recipe",
];

export function AiChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const activeItemId = pathname?.split("/").pop(); // Simplistic active item extraction

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const handleSend = async (text: string = inputValue) => {
    if (!text.trim() || isStreaming) return;

    const userMessage: Message = { id: crypto.randomUUID(), role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsStreaming(true);

    const assistantMsgId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: assistantMsgId, role: "assistant", content: "" }]);

    try {
      // Get the token using the app's existing token endpoint
      const tokenRes = await fetch("/api/auth/token");
      const tokenData = await tokenRes.json();
      const token = tokenData.success ? tokenData.token : "";

      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://127.0.0.1:5000";
      
      const response = await fetch(`${baseUrl}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          conversationHistory: [...messages, userMessage],
          currentContext: {
            url: pathname,
            activeItemId: activeItemId,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect to AI server");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      
      let assistantFullText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        
        // SSE lines look like: data: {"text":"..."}\n\n
        const lines = chunk.split("\n\n");
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "").trim();
            
            if (dataStr === "[DONE]") {
               break;
            }
            
            if (dataStr) {
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  assistantFullText = assistantFullText + parsed.text;
                  
                  // Intercept navigation commands silently
                  const navMatch = assistantFullText.match(/\[NAVIGATE:\s*(.+?)\]/);
                  if (navMatch) {
                    const navPath = navMatch[1].trim();
                    // Remove the token from the visible text
                    assistantFullText = assistantFullText.replace(navMatch[0], "");
                    
                    // Execute navigation
                    router.push(navPath);
                  }

                  // Update the UI
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMsgId
                        ? { ...msg, content: assistantFullText }
                        : msg
                    )
                  );
                }
              } catch (e) {
                console.error("Error parsing SSE JSON:", e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, content: "Sorry, I am having trouble connecting right now." }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3 sm:gap-4 pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring", bounce: 0.25 }}
            className="pointer-events-auto bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-2xl sm:rounded-3xl shadow-[0_12px_40px_rgba(249,115,22,0.15)] w-[calc(100vw-2rem)] sm:w-[380px] h-[500px] sm:h-[600px] max-h-[calc(100dvh-100px)] sm:max-h-[85vh] flex flex-col overflow-hidden relative"
          >
            {/* Ambient Background Glow inside the chat window */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[60px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2" />

            {/* Header */}
            <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md relative z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500 blur-md opacity-40 animate-pulse" />
                  <div className="bg-gradient-to-tr from-orange-500 to-amber-500 p-2.5 rounded-xl text-white relative z-10 shadow-md border border-white/20">
                    <Bot className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <h3 className="font-extrabold text-foreground tracking-tight text-base">Flavor Matrix AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <p className="text-xs font-medium text-default-500">Online & ready</p>
                  </div>
                </div>
              </div>
              <Button 
                isIconOnly 
                size="sm" 
                onPress={() => setIsOpen(false)} 
                className="rounded-full bg-orange-400 text-white hover:bg-orange-500 dark:bg-orange-400 dark:hover:bg-orange-500 text-default-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Chat Area */}
            <ScrollShadow ref={scrollRef} className="flex-1 p-5 flex flex-col gap-5 relative z-10">
              {messages.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="flex-1 flex flex-col items-center justify-center text-center gap-4 mt-8"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-orange-400/20 blur-xl rounded-full" />
                    <Sparkles className="w-12 h-12 text-orange-400 relative z-10" strokeWidth={1.5} />
                  </div>
                  <div className="px-4">
                    <h4 className="text-foreground font-bold text-lg mb-1">Your Culinary AI</h4>
                    <p className="text-sm text-default-500 leading-relaxed">
                      Ask for recipe ideas, cooking techniques, or help navigating the platform!
                    </p>
                  </div>
                </motion.div>
              )}
              
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-100 to-amber-50 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center mr-2 shrink-0 border border-orange-200 dark:border-zinc-600 self-end mb-1 shadow-sm">
                      <Bot className="w-4 h-4 text-orange-500" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-3 text-sm shadow-sm ${
                      msg.role === "user"
                        ? "bg-gradient-to-tr from-orange-500 to-amber-500 text-white rounded-2xl rounded-br-sm shadow-orange-500/20 font-medium"
                        : "bg-white dark:bg-zinc-900/90 text-foreground rounded-2xl rounded-bl-sm border border-black/5 dark:border-white/5"
                    }`}
                  >
                    {/* Render content, checking if it's currently empty (streaming start) */}
                    {msg.role === "assistant" && msg.content === "" && isStreaming ? (
                       <div className="flex gap-1.5 items-center h-6 px-1">
                          <motion.div className="w-2 h-2 bg-orange-500 rounded-full" animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} />
                          <motion.div className="w-2 h-2 bg-amber-500 rounded-full" animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} />
                          <motion.div className="w-2 h-2 bg-orange-400 rounded-full" animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} />
                       </div>
                    ) : (
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                        {msg.role === "assistant" && msg.content && msg.id === messages[messages.length - 1]?.id && isStreaming && (
                          <motion.span 
                            animate={{ opacity: [1, 0] }} 
                            transition={{ repeat: Infinity, duration: 0.7 }}
                            className="inline-block w-1.5 h-3.5 bg-orange-500 ml-1 translate-y-[2px]"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </ScrollShadow>

            {/* Input Area */}
            <div className="p-4 border-t border-black/5 dark:border-white/5 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md relative z-10">
              {messages.length === 0 && (
                <div className="flex flex-wrap gap-2 mb-3 px-1">
                  {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <motion.button
                      key={prompt}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + (i * 0.05) }}
                      onClick={() => handleSend(prompt)}
                      className="text-xs bg-white dark:bg-zinc-800 border border-default-200 dark:border-zinc-700 px-3.5 py-2 rounded-full hover:border-orange-500 hover:text-orange-500 transition-all shadow-sm hover:shadow-md text-left font-medium"
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2 items-end relative">
                <input
                  type="text"
                  className="w-full bg-white dark:bg-zinc-900 border border-default-200 dark:border-zinc-700 shadow-sm pl-4 pr-12 py-3.5 rounded-2xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm transition-all text-foreground"
                  placeholder="Ask me anything..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={isStreaming}
                />
                <div className="absolute right-2 bottom-2">
                  <Button
                    isIconOnly
                    className="bg-gradient-to-tr from-orange-500 to-amber-500 text-white min-w-[32px] w-[32px] h-[32px] rounded-xl flex-shrink-0 shadow-md shadow-orange-500/20 transition-transform hover:scale-105"
                    onPress={() => handleSend()}
                    isDisabled={!inputValue.trim() || isStreaming}
                  >
                    <Send className="w-3.5 h-3.5 ml-0.5" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="pointer-events-auto" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          isIconOnly
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30"
          onPress={() => setIsOpen(!isOpen)}
          aria-label="Toggle AI Assistant"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
        </Button>
      </motion.div>
    </div>
  );
}
