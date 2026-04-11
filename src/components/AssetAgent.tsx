"use client";

import React, { useState, useRef, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { MessageSquare, X, Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const slideIn = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
`;

const AgentContainer = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
`;

const FloatingButton = styled.button<{ $isOpen: boolean }>`
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px var(--primary-glow);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: scale(1.1) rotate(${props => props.$isOpen ? '90deg' : '0deg'});
    box-shadow: 0 12px 40px var(--primary-glow);
  }

  ${props => props.$isOpen && css`
    background: var(--card-bg);
    color: var(--foreground);
    border: 1px solid var(--card-border);
  `}
`;

const ChatWindow = styled.div`
  width: 24rem;
  height: 32rem;
  background: var(--card-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--card-border);
  border-radius: 1.5rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  animation: ${fadeIn} 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;

  @media (max-width: 480px) {
    width: calc(100vw - 2rem);
    height: 70vh;
    right: 1rem;
    bottom: 6rem;
  }
`;

const ChatHeader = styled.div`
  padding: 1rem 1.5rem;
  background: rgba(99, 102, 241, 0.1);
  border-bottom: 1px solid var(--card-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const OnlineBadge = styled.div`
  width: 0.5rem;
  height: 0.5rem;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 10px #10b981;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--card-border);
    border-radius: 10px;
  }
`;

const MessageBubble = styled.div<{ $isUser: boolean }>`
  max-width: 85%;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  line-height: 1.5;
  position: relative;
  
  ${props => props.$isUser ? css`
    align-self: flex-end;
    background: var(--primary);
    color: white;
    border-bottom-right-radius: 0.25rem;
  ` : css`
    align-self: flex-start;
    background: var(--glass);
    border: 1px solid var(--card-border);
    color: var(--foreground);
    border-bottom-left-radius: 0.25rem;
  `}

  p { margin: 0; }
  ul, ol { margin: 0.5rem 0; padding-left: 1.25rem; }
  li { margin-bottom: 0.25rem; }
  strong { color: inherit; font-weight: 700; }
`;

const InputArea = styled.form`
  padding: 1rem;
  background: var(--card-bg);
  border-top: 1px solid var(--card-border);
  display: flex;
  gap: 0.5rem;
`;

const StyledInput = styled.input`
  flex: 1;
  background: var(--glass);
  border: 1px solid var(--card-border);
  border-radius: 0.75rem;
  padding: 0.625rem 1rem;
  color: var(--foreground);
  font-size: 0.875rem;
  outline: none;

  &:focus {
    border-color: var(--primary);
  }
`;

const SendButton = styled.button`
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 0.75rem;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Asset {
  name: string;
  symbol: string;
  value: string;
  change: string;
  volume: string;
}

export default function AssetAgent({ ledgerData }: { ledgerData: Asset[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your Asset Ledger Copilot. Ask me anything about the current market trends or specific assets." }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }].map(m => ({
            role: m.role === "assistant" ? "model" : "user",
            content: m.content
          })),
          ledgerData
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.message || data.error);

      setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please make sure your API key is configured." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AgentContainer>
      {isOpen && (
        <ChatWindow>
          <ChatHeader>
            <HeaderInfo>
              <Bot size={20} color="var(--primary)" />
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 700 }}>Asset Copilot</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <OnlineBadge /> AI Assistant Online
                </div>
              </div>
            </HeaderInfo>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </ChatHeader>

          <MessagesContainer>
            {messages.map((m, i) => (
              <MessageBubble key={i} $isUser={m.role === "user"}>
                {m.role === "assistant" ? (
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                ) : (
                  m.content
                )}
              </MessageBubble>
            ))}
            {isLoading && (
              <MessageBubble $isUser={false}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Loader2 size={14} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  Thinking...
                </div>
              </MessageBubble>
            )}
            <div ref={messagesEndRef} />
          </MessagesContainer>

          <InputArea onSubmit={handleSubmit}>
            <StyledInput 
              placeholder="Ask about trends, gainers..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <SendButton type="submit" disabled={!input.trim() || isLoading}>
              <Send size={16} />
            </SendButton>
          </InputArea>
        </ChatWindow>
      )}

      <FloatingButton $isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : (
          <div style={{ position: 'relative' }}>
            <Sparkles size={24} />
            <div style={{ 
              position: 'absolute', 
              top: -4, 
              right: -4, 
              width: '10px', 
              height: '10px', 
              background: '#10b981', 
              borderRadius: '50%',
              border: '2px solid var(--primary)'
            }} />
          </div>
        )}
      </FloatingButton>
    </AgentContainer>
  );
}
