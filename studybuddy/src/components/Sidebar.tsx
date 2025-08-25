import React from "react";

interface ChatHistoryItem {
  id: string;
  label: string;
}

interface SidebarProps {
  chats: ChatHistoryItem[];
  activeChatId: string;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
}

export default function Sidebar({ chats, activeChatId, onSelectChat, onNewChat }: SidebarProps) {
  return (
    <aside className="w-85 bg-blue-200 dark:bg-blue-900 p-4 flex flex-col gap-2 border-r border-blue-300">
      <h2 className="text-lg font-bold text-blue-700 mb-4">Chat History</h2>
      <button
        className="mb-4 py-2 px-3 rounded-lg bg-blue-500 text-white font-semibold border border-blue-300 hover:bg-blue-600 transition"
        onClick={onNewChat}
      >
        + New Chat
      </button>
      <div className="flex flex-col gap-2">
        {chats.length === 0 && (
          <div className="text-blue-700 text-sm">No chats yet.</div>
        )}
        {chats.map((chat) => (
          <button
            key={chat.id}
            className={`py-2 px-3 rounded-lg text-left font-medium transition border border-blue-300 truncate ${
              activeChatId === chat.id
                ? "bg-blue-500 text-white"
                : "bg-blue-100 text-blue-900 hover:bg-blue-300"
            }`}
            onClick={() => onSelectChat(chat.id)}
          >
            {chat.label}
          </button>
        ))}
      </div>
    </aside>
  );
}