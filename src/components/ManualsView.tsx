import React, { useState } from 'react';
import { WallpenManualItem } from '../types';
import { MOCK_MANUALS } from '../data/mockData';
import {
  BookOpen,
  Download,
  Search,
  FileText,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Cpu,
  Layers,
} from 'lucide-react';

export const ManualsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiQuery, setAiQuery] = useState('');
  const [isAskingAi, setIsAskingAi] = useState(false);

  const categories = [
    'all',
    'Hardware & Assembly',
    'Calibration & Lasers',
    'UV Ink & Printing',
    'Software & RIP',
  ];

  const filteredManuals = MOCK_MANUALS.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.titleKr.includes(searchTerm) ||
      m.descriptionKo.includes(searchTerm);

    if (selectedCategory === 'all') return matchesSearch;
    return matchesSearch && m.category === selectedCategory;
  });

  const handleAskTechAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setIsAskingAi(true);
    try {
      const res = await fetch('/api/tech-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: aiQuery,
          userRole: 'eurotech_korea',
          lang: 'ko',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAiAnswer(data.answer);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAskingAi(false);
    }
  };

  return (
    <div className="flex-1 p-6 bg-slate-950 text-white overflow-y-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold text-white">
            Wallpen 수직 프린터 기술 매뉴얼 & 스펙 라이브러리
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          독일 본사 공식 하드웨어 가이드, 레이저 거리 센서 보정표, Eco-UV 잉크 프로필 및 RIP 매뉴얼
        </p>
      </div>

      {/* Gemini Wallpen Technical AI Assistant Box */}
      <div className="bg-gradient-to-r from-blue-900/60 via-slate-900 to-indigo-950/60 border border-blue-800/80 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center space-x-2 text-amber-300">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-sm text-white">
            Wallpen AI 매뉴얼 및 기술 어시스턴트 (실시간 검색)
          </h3>
        </div>

        <form onSubmit={handleAskTechAssistant} className="flex gap-2">
          <input
            type="text"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            placeholder="예: Wallpen E2 노즐 막힘 해결용 솔벤트 퍼징 절차 및 적정 온도를 알려줘..."
            className="flex-1 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isAskingAi || !aiQuery.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all disabled:opacity-50 shrink-0"
          >
            {isAskingAi ? 'Gemini 검색 중...' : '매뉴얼 AI 답변 받기'}
          </button>
        </form>

        {aiAnswer && (
          <div className="mt-3 p-4 bg-slate-950/90 rounded-xl border border-blue-800/80 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
            <span className="font-bold text-amber-400 block mb-1">🤖 Wallpen AI 답변:</span>
            {aiAnswer}
          </div>
        )}
      </div>

      {/* Filter & Category Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white border-blue-500 font-bold shadow-md'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {cat === 'all' ? '전체 카테고리' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="매뉴얼 검색..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Manuals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredManuals.map((m) => (
          <div
            key={m.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold px-2.5 py-0.5 rounded-full">
                  {m.category}
                </span>
                <span className="text-slate-400 font-mono">v{m.version}</span>
              </div>

              <h3 className="font-bold text-sm text-slate-100">{m.titleKr}</h3>
              <p className="text-xs font-mono text-slate-400">{m.title}</p>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {m.descriptionKo}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>용량: <strong className="text-slate-200">{m.fileSize}</strong></span>
              <button
                onClick={() => alert(`[${m.title}] 매뉴얼 다운로드가 시작되었습니다.`)}
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-3 py-1.5 rounded-xl font-medium flex items-center space-x-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF 다운로드</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
