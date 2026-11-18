'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { yftiParticipants } from '@/lib/mockData';
import { ArrowLeft, Send, Building2, Sparkles } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
}

const QUICK_REPLIES = [
  'สวัสดีครับ สนใจพูดคุยเรื่อง Business Synergy ครับ',
  'ขออนุญาตสอบถามข้อมูลสินค้า/บริการเพิ่มเติมครับ',
  'ยินดีที่ได้รู้จักเพื่อนร่วมรุ่น YFTI 11 ครับ',
];

export default function PrivateChatPage() {
  const params = useParams();
  const id = String(params?.id || '');
  const participant =
    yftiParticipants.find((p) => String(p.id) === id) || yftiParticipants[0];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const storageKey = `yfti_chat_${participant.id}`;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          setMessages(JSON.parse(saved));
          return;
        }
      } catch {}
    }
    setMessages([
      {
        id: 'm-init',
        sender: 'them',
        text: `สวัสดีครับ/ค่ะ ยินดีที่ได้เชื่อมต่อธุรกิจในเครือข่าย Young FTI ELITE 11 ครับ สามารถทักทายหรือนัดคุย Synergy ได้เลยนะครับ`,
        time: 'เมื่อสักครู่',
      },
    ]);
  }, [storageKey]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'me',
      text: trimmed,
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };
    const next = [...messages, newMsg];
    setMessages(next);
    setInputText('');
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(next));
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full h-[calc(100dvh-160px)] md:h-[calc(100dvh-140px)] min-h-[480px] px-4 sm:px-6 py-4 flex flex-col">
      {/* Chat Header */}
      <div className="bg-[#1E2538] text-white rounded-t-3xl p-4 flex items-center gap-3 shadow-md shrink-0">
        <Link
          href={`/yfti_participants/${participant.id}`}
          aria-label="กลับหน้าโปรไฟล์"
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <img
          src={participant.profile_picture_url || 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/participants/p_3296.webp'}
          alt={participant.name_thai}
          className="w-10 h-10 rounded-full object-cover border border-white/30 shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/participants/p_3296.webp';
          }}
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-black truncate">
            {participant.name_thai} {participant.nickname_eng ? `(${participant.nickname_eng})` : ''}
          </h1>
          <p className="text-[11px] text-slate-300 truncate flex items-center gap-1">
            <Building2 className="w-3 h-3 text-[#E5C158] shrink-0" />
            {participant.company_name_thai || participant.company_name_eng || 'YFTI 11 Member'}
          </p>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div ref={listRef} className="flex-1 bg-white border-x border-slate-200 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'me'
                  ? 'bg-[#1E2538] text-white rounded-br-sm'
                  : 'bg-slate-100 text-[#1E2538] rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
          </div>
        ))}
      </div>

      {/* Quick Replies + Input */}
      <div className="bg-slate-50 border border-slate-200 rounded-b-3xl p-3 space-y-2.5 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <Sparkles className="w-3.5 h-3.5 text-[#B38728] shrink-0" />
          {QUICK_REPLIES.map((qr) => (
            <button
              key={qr}
              onClick={() => sendMessage(qr)}
              className="px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-medium text-slate-600 hover:border-[#C59B38] hover:text-[#1E2538] whitespace-nowrap transition"
            >
              {qr}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(inputText);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="พิมพ์ข้อความถึงเจ้าของธุรกิจ..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2538]"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-2xl bg-[#C59B38] hover:bg-[#b58b2e] disabled:opacity-40 text-white flex items-center justify-center transition shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
