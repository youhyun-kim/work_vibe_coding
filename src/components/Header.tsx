import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  Video,
  User,
  Building2,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile;
  onSwitchUser: () => void;
  onOpenVideoCall: () => void;
  isCallActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSwitchUser,
  onOpenVideoCall,
  isCallActive,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const isEurotech = currentUser.company === 'eurotech_korea';

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Identity (Eurotech Korea x Wallpen Germany) */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-lg text-white shadow-inner flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base sm:text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">
                  Eurotech × Wallpen
                </span>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> AI 동시통역 Connect
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                한국 총판 (주)유로테크 & 독일 Wallpen GmbH 본사 전용 화상회의
              </p>
            </div>
          </div>
        </div>

        {/* Right: Quick Call Launcher & Active User Profile */}
        <div className="flex items-center space-x-3">
          {/* Quick Call Button */}
          {!isCallActive && (
            <button
              onClick={onOpenVideoCall}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs sm:text-sm px-3.5 py-2 rounded-lg shadow-sm flex items-center space-x-1.5 transition-all transform hover:scale-[1.02] active:scale-95"
            >
              <Video className="w-4 h-4 text-emerald-100 animate-pulse" />
              <span>본사-총판 AI 화상회의 시작</span>
            </button>
          )}

          {isCallActive && (
            <div className="flex items-center space-x-2 bg-rose-500/20 border border-rose-500/40 text-rose-300 px-3 py-1.5 rounded-lg text-xs font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>동시통역 통화 중</span>
            </div>
          )}

          {/* User Role Badge & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1.5 rounded-xl transition-colors text-left"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/40"
              />
              <div className="hidden lg:block">
                <div className="text-xs font-semibold text-slate-100 flex items-center gap-1">
                  <span>{currentUser.name}</span>
                  <span className="text-[10px] text-amber-400">
                    {isEurotech ? '🇰🇷 총판' : '🇩🇪 독일본사'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                  {currentUser.roleTitleKr || currentUser.roleTitle}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Menu Popup */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs">
                <div className="px-4 py-2 border-b border-slate-700">
                  <p className="font-bold text-slate-100">{currentUser.name}</p>
                  <p className="text-slate-400 text-[11px]">{currentUser.email}</p>
                  <div className="mt-1.5 inline-flex items-center gap-1 bg-slate-900/80 px-2 py-0.5 rounded text-[10px] text-blue-300 border border-slate-700">
                    <Building2 className="w-3 h-3 text-blue-400" />
                    <span>{currentUser.companyName}</span>
                  </div>
                </div>

                <div className="py-1">
                  <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                    현재 로그인 계정 모드
                  </div>
                  <div className="px-4 py-1 text-slate-300 flex items-center justify-between">
                    <span>언어 설정</span>
                    <span className="font-mono text-amber-400 font-bold uppercase">
                      {currentUser.preferredLang}
                    </span>
                  </div>
                  <div className="px-4 py-1 text-slate-300 flex items-center justify-between">
                    <span>소속</span>
                    <span className="text-slate-200">
                      {isEurotech ? '한국 총판' : '독일 HQ'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-1 mt-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onSwitchUser();
                    }}
                    className="w-full text-left px-4 py-2 text-amber-300 hover:bg-slate-700/80 flex items-center space-x-2 font-medium"
                  >
                    <User className="w-4 h-4" />
                    <span>계정/권한 전환 (Eurotech ↔ Wallpen)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
