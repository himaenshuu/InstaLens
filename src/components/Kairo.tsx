import { useState, useRef, useEffect } from "react";
import { Send, X, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "./ui/utils";
import { sendMessageToKairo } from "../services/kairoService";

interface Message {
  id: string;
  text: string;
  sender: "user" | "kairo";
  timestamp: Date;
}

export default function Kairo() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm Kairo, your personal assistant for InstaLens. I'm here to help you use this app wisely and get the most out of your Instagram analytics. How can I assist you today?",
      sender: "kairo",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await sendMessageToKairo(inputValue.trim(), messages);

      const kairoMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: "kairo",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, kairoMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        sender: "kairo",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transition-all duration-300"
          size="icon"
        >
          <MessageCircle className="h-6 w-6 text-white" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
          </span>
        </Button>
      )}

      {isOpen && (
        <div className="flex flex-col bg-black border-2 border-purple-600/30 rounded-2xl shadow-2xl w-[380px] h-[600px] overflow-hidden backdrop-blur-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 p-4 border-b border-purple-600/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-black rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Kairo</h3>
                  <p className="text-xs text-purple-300">
                    Your InstaLens Assistant
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-purple-300 hover:text-white hover:bg-purple-800/50"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-black via-gray-950 to-black">
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 animate-in slide-in-from-bottom-2 duration-500",
                    message.sender === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.sender === "kairo" && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 max-w-[75%] break-words shadow-lg",
                      message.sender === "user"
                        ? "bg-gradient-to-br from-purple-600 to-indigo-700 text-white"
                        : "bg-gray-900 text-gray-100 border border-purple-600/20"
                    )}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.text}
                    </p>
                    <span className="text-[10px] opacity-60 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {message.sender === "user" && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-semibold">
                        You
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start animate-in slide-in-from-bottom-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-900 rounded-2xl px-4 py-3 border border-purple-600/20">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 bg-purple-500 rounded-full animate-bounce"></span>
                      <span className="h-2 w-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="h-2 w-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 bg-gradient-to-t from-black via-gray-950 to-transparent border-t border-purple-600/30">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Kairo anything..."
                disabled={isLoading}
                className="flex-1 bg-gray-900 border-purple-600/30 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/50"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-br from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-gray-600 mt-2 text-center">
              Powered by Gemini 2.0 Flash Lite
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
