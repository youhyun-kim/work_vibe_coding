import React from 'react';
import { MainViewTab, UserProfile } from '../types';
import {
  Video,
  FileText,
  Building2,
  Globe2,
  ArrowRightLeft,
} from 'lucide-react';

interface SidebarNavProps {
  currentTab: MainViewTab;
  onSelectTab: (tab: MainViewTab) => void;
  currentUser: UserProfile;
  onSwitchUser: () => void;
  unreadTicketsCount?: number;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onSwitchUser,
}) => {
  const isEurotech = currentUser.company === 'eurotech_korea';

  const menuItems = [
    {
      id: 'video_conference' as MainViewTab,
      labelKo: '화상회의 & AI 동시통역',
      labelEn: 'Video Call & Live Translation',
      icon: Video,
      badge: 'Live AI',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    ...(isEurotech
      ? [
          {
            id: 'meeting_history' as MainViewTab,
            labelKo: 'AI 통역 회의록 & 요약아카이브',
            labelEn: 'AI Transcripts & Summaries',
            icon: FileText,
            badge: '총판 전용',
            badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          },
        ]
      : []),
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
      {/* Top Section: Active Role Badge & Navigation List */}
      <div className="p-4 space-y-6">
        {/* Company Active Banner */}
        <div className={`p-3 rounded-xl border ${
          isEurotech
            ? 'bg-blue-950/50 border-blue-800/60 text-blue-100'
            : 'bg-amber-950/40 border-amber-800/60 text-amber-100'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isEurotech ? '🇰🇷 한국 총판 모드' : '🇩🇪 독일 본사 모드'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div className="font-bold text-sm truncate flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">{currentUser.companyName}</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-300">
            접속자: <span className="font-semibold text-white">{currentUser.name}</span>
          </div>
        </div>

        {/* Dynamic Navigation Menu */}
        <nav className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {isEurotech ? '유로테크 전용 메뉴' : 'Wallpen HQ Navigation'}
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">
                    {isEurotech ? item.labelKo : item.labelEn}
                  </span>
                </div>

                {item.badge && (
                  <span
                    className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                      item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Role Switcher Quick Access */}
      <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900/50">
        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs">
          <div className="flex items-center space-x-2 text-slate-300 mb-1">
            <Globe2 className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-white">AI 동시통역 지원 언어</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            한국어(KO) ↔ 영어(EN) / 독일어(DE) 실시간 감지 및 Gemini 음성 통역
          </p>
        </div>

        <button
          onClick={onSwitchUser}
          className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-semibold py-2.5 px-3 rounded-xl transition-all"
        >
          <ArrowRightLeft className="w-4 h-4 text-amber-400" />
          <span>계정 권한 변경 / 시연 모드</span>
        </button>
      </div>
    </aside>
  );
};
