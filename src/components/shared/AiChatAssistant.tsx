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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-content1/90 backdrop-blur-xl border border-divider rounded-2xl shadow-[0_8px_30px_rgba(249,115,22,0.08)] w-[360px] h-[550px] max-h-[80vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-divider flex items-center justify-between bg-gradient-to-r from-orange-500/10 to-amber-500/10">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-tr from-orange-500 to-amber-500 p-2 rounded-full text-white shadow-md shadow-orange-500/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Flavor Matrix AI</h3>
                  <p className="text-xs text-default-500">Your culinary assistant</p>
                </div>
              </div>
              <Button isIconOnly variant="light" size="sm" onPress={() => setIsOpen(false)} className="text-default-500 hover:text-foreground">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Chat Area */}
            <ScrollShadow ref={scrollRef} className="flex-1 p-4 flex flex-col gap-4">
              {messages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 text-default-400 mt-8">
                  <Sparkles className="w-10 h-10 text-orange-400/50" />
                  <p className="text-sm px-4">
                    Ask me for recipe ideas, cooking tips, or help navigating the platform!
                  </p>
                </div>
              )}
              
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.role === "user"
                        ? "bg-gradient-to-tr from-orange-500 to-amber-500 text-white rounded-br-sm shadow-md shadow-orange-500/20"
                        : "bg-default-100 dark:bg-zinc-800 text-foreground rounded-bl-sm border border-default-200 dark:border-zinc-700"
                    }`}
                  >
                    {/* Render content, checking if it's currently empty (streaming start) */}
                    {msg.role === "assistant" && msg.content === "" && isStreaming ? (
                       <div className="flex gap-1 items-center h-5">
                          <motion.div className="w-1.5 h-1.5 bg-default-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                          <motion.div className="w-1.5 h-1.5 bg-default-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                          <motion.div className="w-1.5 h-1.5 bg-default-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                       </div>
                    ) : (
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </ScrollShadow>

            {/* Input Area */}
            <div className="p-3 border-t border-divider bg-default-50/50">
              {messages.length === 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSend(prompt)}
                      className="text-xs bg-white dark:bg-zinc-800 border border-default-200 dark:border-zinc-700 px-3 py-1.5 rounded-full hover:border-orange-500 hover:text-orange-500 transition-colors shadow-sm text-left"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2 items-end">
                <input
                  type="text"
                  className="w-full bg-white dark:bg-zinc-800 border border-default-200 dark:border-zinc-700 shadow-sm px-4 py-2.5 rounded-xl outline-none focus:border-primary text-sm transition-colors text-foreground"
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
                <Button
                  isIconOnly
                  className="btn-primary min-w-[40px] w-[40px] h-[40px] rounded-xl flex-shrink-0"
                  onPress={() => handleSend()}
                  isDisabled={!inputValue.trim() || isStreaming}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          isIconOnly
          className="w-14 h-14 rounded-full btn-primary shadow-lg shadow-orange-500/30"
          onPress={() => setIsOpen(!isOpen)}
          aria-label="Toggle AI Assistant"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
        </Button>
      </motion.div>
    </div>
  );
}
