'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect } from 'react';
import { PromptSuggestions } from '../components/Promptsuggestions';
import Sidebar from '../components/Sidebar';
import { ScrollArea } from '../components/ui/scroll-area';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { SelectEducation } from '../components/Selecteducation';

export default function Chat() {
  const [input, setInput] = useState('');
  const [educationLevel, setEducationLevel] = useState('Unknown');
  const [chats, setChats] = useState<{ [id: string]: { messages: any[]; label: string, educationLevel: string } }>({});
  const [activeChatId, setActiveChatId] = useState<string>('chat-1');
  const [chatCounter, setChatCounter] = useState<number>(1);
  const { messages, sendMessage, setMessages } = useChat();

  // Save chat history on message change
  useEffect(() => {
    // Only register a chat after the first message is sent and educationLevel is valid
    if (educationLevel !== 'Unknown' && messages.length > 0) {
      setChats((prev) => {
        const lastUserMsgObj = messages.filter(m => m.role === 'user').slice(-1)[0];
        let lastUserMsg = 'New Chat';
        if (lastUserMsgObj && Array.isArray(lastUserMsgObj.parts)) {
          const textPart = lastUserMsgObj.parts.find(p => p.type === 'text');
          lastUserMsg = textPart && 'text' in textPart ? textPart.text : 'New Chat';
        }
        return {
          ...prev,
          [activeChatId]: {
            messages,
            label: lastUserMsg,
            educationLevel,
          },
        };
      });
    }
  }, [messages, activeChatId, educationLevel]);

  // Start a new chat
  const handleNewChat = (level?: string) => {
    const newId = `chat-${chatCounter + 1}`;
    setActiveChatId(newId);
    setChatCounter((prev) => prev + 1);
    setMessages([]);
    setInput('');
    if (level) setEducationLevel(level);
  };

  // Select a chat from history
  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    setMessages(chats[id]?.messages || []);
    setEducationLevel(chats[id]?.educationLevel || 'Unknown');
    setInput('');
  };

  return (
    <div className="flex flex-row min-h-screen bg-blue-100 dark:bg-gray-900">
      {/* Sidebar for chat history */}
      <Sidebar
        chats={Object.entries(chats).map(([id, chat]) => ({ id, label: chat.label }))}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
      />
      <div className="flex flex-col items-center justify-center flex-1 p-4">
        <Card className="w-full max-w-2xl h-[80vh] flex flex-col shadow-lg rounded-xl border-blue-400 bg-white">
          <CardHeader>
            <CardTitle className='text-4xl text-blue-600'>Study Buddy!</CardTitle>
            <p>AI to helps you study, just write yout question</p>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            {/* SelectStudy : Select your education level before ask */}
            <ScrollArea className="h-full p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg my-3 whitespace-pre-wrap break-words min-w-[60px] max-w-[90%] md:max-w-md w-fit ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white self-end ml-auto'
                      : 'bg-gray-100 text-blue-800 self-start mr-auto'
                  }`}
                >
                  {message.parts.map((part, i) => {
                    if (part.type === 'text') {
                      return <span key={`${message.id}-${i}`}>{part.text}</span>;
                    }
                    return null;
                  })}
                </div>
              ))}
            </ScrollArea>
          </CardContent>

          {/* PromptSuggestions Component - now styled inline for matching theme */}
          <div className="flex-shrink-0 px-4 pb-2">
            <PromptSuggestions sendMessage={sendMessage} />
          </div>

          <div className="p-2 border-t bg-white">
            <form
              className="flex flex-col gap-2 md:flex-row md:items-center md:space-x-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (educationLevel === 'Unknown') return;
                if (input.trim()) {
                  sendMessage({ text: input });
                  setInput('');
                }
              }}
            >
              {/* Education Level Dropdown */}
              <SelectEducation value={educationLevel} onChange={setEducationLevel} />
              <Input
                type="text"
                placeholder="Select your education level first..."
                className="flex-1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={educationLevel === 'Unknown'}
              />
              <Button className="bg-blue-400" type="submit" disabled={educationLevel === 'Unknown'}>Send</Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}