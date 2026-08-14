import React from 'react';
import { UserProfile, CompanyType } from '../types';
import { MOCK_USERS } from '../data/mockData';
import {
  X,
  User,
  Building2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Globe2,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600/20 text-blue-400 p-2 rounded-xl border border-blue-500/30">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Eurotech × Wallpen Connect 계정 로그인 / 역할 전환
              </h2>
              <p className="text-xs text-slate-400">
                접속 회사(유로테크 한국 총판 ↔ 독일 Wallpen 본사) 계정에 따라 메뉴와 권한이 변경됩니다.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Accounts Selection Grid */}
        <div className="space-y-4">
          {/* Section 1: Eurotech Korea Accounts */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
              <span>🇰🇷 (주)유로테크 계정 (Wallpen Korea General Distributor)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MOCK_USERS.filter((u) => u.company === 'eurotech_korea').map((u) => {
                const isSelected = currentUser.id === u.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      onSelectUser(u);
                      onClose();
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? 'bg-blue-950/80 border-blue-500 ring-2 ring-blue-500/30'
                        : 'bg-slate-950 hover:bg-slate-850 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-100 flex items-center gap-1">
                          <span>{u.name}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                        </div>
                        <div className="text-[10px] text-slate-400">{u.roleTitleKr || u.roleTitle}</div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 bg-slate-900/80 p-2 rounded border border-slate-800">
                      • 접근 메뉴: 한국 대시보드, 본사 A/S 티켓 발행, 한국어-독일어 동시통역
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Wallpen Germany HQ Accounts */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <span>🇩🇪 Wallpen GmbH Germany 계정 (독일 헤르포르트 본사)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MOCK_USERS.filter((u) => u.company === 'wallpen_germany').map((u) => {
                const isSelected = currentUser.id === u.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      onSelectUser(u);
                      onClose();
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? 'bg-amber-950/80 border-amber-500 ring-2 ring-amber-500/30'
                        : 'bg-slate-950 hover:bg-slate-850 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500/30"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-100 flex items-center gap-1">
                          <span>{u.name}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <div className="text-[10px] text-slate-400">{u.roleTitle}</div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 bg-slate-900/80 p-2 rounded border border-slate-800">
                      • Access: HQ Operations, Korea Support Ticket Escalations, German/English Translation
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-4 py-2 rounded-xl"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
