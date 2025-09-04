"use client";

import { useState, useRef, useEffect } from "react";
import { useChatStore } from "./store/chatStore";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Page() {
  const [input, setInput] = useState("");
  const [educationLevel, setEducationLevel] = useState("SD");

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
    
    // Jika belum ada chat yang aktif, wajib membuat/ memilih chat terlebih dahulu
    if (!chatId) {
      alert('Pilih atau buat chat terlebih dahulu');
      return;
    }

    // Tambahkan prefix level pendidikan ke pesan
    const educationPrefix = educationLevel ? `[Halo, aku di tingkat: ${educationLevel}]\n` : '';
    const messageWithEducation = educationPrefix + input;

    await sendMessage(messageWithEducation, chatId);
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

  const { data: session } = useSession();

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

            {/* Tombol Authentikasi */}
          <div>
          {session ? (
            <>
              <p>Hi, {session.user?.name}</p>
              <button onClick={() => signOut()}>Logout</button>
            </>
          ) : (
            <button onClick={() => signIn("google")}>Login dengan Google</button>
          )}
        </div>
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
        <div className="flex items-center justify-between p-3 border-b">
    <div className="flex items-center gap-2">
      <img src="/logo SB.png" alt="StudyBuddy Logo" className="h-9 w-11" />
      <span className="font-bold text-blue-600">StudyBuddy</span>
    </div>

          {/* Dropdown Level Pendidikan */}
          <select
            value={educationLevel}
            onChange={(e) => setEducationLevel(e.target.value)}
            className="border rounded-md px-2 py-1 text-sm"
          >
            <option value="SD">SD</option>
            <option value="SMP">SMP</option>
            <option value="SMA">SMA</option>
            <option value="Kuliah">Kuliah</option>
          </select>
        </div>

        {/* Chat Messages */}
        <ScrollArea.Root className="flex-1 overflow-hidden">
          <ScrollArea.Viewport
            ref={scrollRef}
            className="h-full w-full p-4 space-y-3"
            style={{ height: "100%" }}
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
                  key={msg.id != null ? `db-${msg.id}` : `ui-${msg.created_at ?? i}`}
                  className={`my-3 max-w-[80%] ${
                    msg.role === "user" ? "ml-auto" : "mr-auto"
                  }`}
                >
                  {/* Message Header */}
                  <div
                    className={`text-md font-medium mb-1 ${
                      msg.role === "user"
                        ? "text-right text-blue-600"
                        : "text-left text-gray-600"
                    }`}
                  >
                    {msg.role === "user" ? "User" : "StudyBot"}
                  </div>
                  
                  {/* Message Content */}
                  <div
                    className={`p-3 rounded-xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-white border"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <div>{msg.content}</div>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
              orientation="vertical"
              className="flex select-none touch-none p-0.5 bg-gray-100 transition-colors duration-150 ease-out hover:bg-gray-200"
            >
            <ScrollArea.Thumb className="flex-1 rounded-full bg-gray-400" />
          </ScrollArea.Scrollbar>
          <ScrollArea.Corner className="bg-gray-200" />
        </ScrollArea.Root>
   
        {/* Card Buttons */}
        {/* <div className="flex gap-2 p-3 border-t bg-gray-50">
          <button 
            onClick={() => handleQuickMessage("Buatkan saya soal latihan dari topik yang dibahas")}
            className="px-3 py-2 rounded-lg text-sm bg-green-500 text-white hover:bg-green-600"
          >
            + Soal
          </button>
          <button 
            onClick={() => handleQuickMessage("Buatkan flashcard untuk membantu saya belajar topik ini")}
            className="px-3 py-2 rounded-lg text-sm bg-purple-500 text-white hover:bg-purple-600"
          >
            + Flashcard
          </button>
          <button 
            onClick={() => handleQuickMessage("Buatkan pertanyaan reflektif untuk membantu saya memahami topik ini lebih dalam")}
            className="px-3 py-2 rounded-lg text-sm bg-orange-500 text-white hover:bg-orange-600"
          >
            + Reflective Q
          </button>
        </div>

        <Separator.Root className="bg-gray-200 h-px w-full" /> */}

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
            placeholder={currentChatId ? "Jelasin apa kesulitanmu dalam belajar..." : "Klik + Chat Baru untuk memulai"}
            onChange={(e) => setInput(e.target.value)}
            disabled={!currentChatId}
          />
          <button
            type="submit"
            disabled={!input.trim() || !currentChatId}
            className="px-4 py-2 rounded-lg border bg-blue-500 hover:bg-blue-600 text-white text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Kirim
          </button>
        </form>
      </div>
    </div>
  );
}