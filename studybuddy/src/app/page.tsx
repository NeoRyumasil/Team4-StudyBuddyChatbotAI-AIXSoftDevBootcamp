"use client";

import { useState, useRef, useEffect } from "react";
import { useChatStore } from "./store/chatStore";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as Separator from "@radix-ui/react-separator";

export default function Page() {
  const [input, setInput] = useState("");
  const { 
    messages, 
    chats,
    currentChatId,
    isLoading,
    loadMessages,
    loadChats,
    createNewChat,
    sendMessage,
    setCurrentChatId
  } = useChatStore();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Load chats saat komponen pertama kali dimuat
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Auto scroll ke bawah saat ada pesan baru
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    let chatId = currentChatId;
    
    // Jika belum ada chat yang aktif, buat chat baru
    if (!chatId) {
      const newTitle = input.length > 50 ? input.substring(0, 50) + "..." : input;
      chatId = await createNewChat(newTitle);
      if (!chatId) {
        alert('Gagal membuat chat baru');
        return;
      }
      setCurrentChatId(chatId);
    }

    await sendMessage(input, chatId);
    setInput("");
  };

  const handleSelectChat = async (chatId: number) => {
    setCurrentChatId(chatId);
    await loadMessages(chatId);
  };

  const handleNewChat = async () => {
    const chatId = await createNewChat();
    if (chatId) {
      setCurrentChatId(chatId);
      // Clear messages untuk chat baru
      useChatStore.setState({ messages: [] });
    }
  };

  return (
    <div className="flex w-full h-screen">
      {/* Sidebar - Daftar Chat */}
      <div className="w-64 border-r bg-gray-50 flex flex-col">
        <div className="p-3 border-b">
          <button
            onClick={handleNewChat}
            className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
          >
            + Chat Baru
          </button>
        </div>
        
        <ScrollArea.Root className="flex-1">
          <ScrollArea.Viewport className="h-full w-full p-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat.id)}
                className={`p-3 mb-2 rounded-lg cursor-pointer text-sm hover:bg-gray-100 ${
                  currentChatId === chat.id ? 'bg-gray-200' : ''
                }`}
              >
                <div className="font-medium truncate">{chat.title}</div>
                {chat.last_message && (
                  <div className="text-gray-500 text-xs mt-1 truncate">
                    {chat.last_message}
                  </div>
                )}
              </div>
            ))}
          </ScrollArea.Viewport>
        </ScrollArea.Root>
      </div>

      {/* Area Chat */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-3 border-b bg-white">
          <h1 className="font-medium text-gray-900">
            {currentChatId ? 
              chats.find(c => c.id === currentChatId)?.title || 'Chat' : 
              'Pilih atau buat chat baru'
            }
          </h1>
        </div>

        {/* Chat Messages */}
        <ScrollArea.Root className="flex-1 overflow-hidden">
          <ScrollArea.Viewport
            ref={scrollRef}
            className="h-full w-full p-4 space-y-3"
          >
            {isLoading ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                {currentChatId ? 
                  "Belum ada pesan. Mulai percakapan!" : 
                  "Pilih chat atau buat chat baru untuk memulai"
                }
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={msg.id || i}
                  className={`p-3 my-3 rounded-xl max-w-[80%] text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "ml-auto bg-blue-500 text-white"
                      : "mr-auto bg-white border"
                  }`}
                >
                  {msg.content}
                </div>
              ))
            )}
          </ScrollArea.Viewport>
        </ScrollArea.Root>

        <Separator.Root className="bg-gray-200 h-px w-full" />

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 flex gap-2 border-t bg-white"
        >
          <input
            className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400"
            value={input}
            placeholder="Tulis pesan..."
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-2 rounded-lg border bg-blue-500 hover:bg-blue-600 text-white text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Kirim
          </button>
        </form>
      </div>
    </div>
  );
}