import React from 'react';
import { UserProfile, TechTicket } from '../types';
import {
  Building2,
  Video,
  Wrench,
  Package,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Globe2,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  FileText,
  Boxes,
} from 'lucide-react';

interface EurotechDashboardProps {
  currentUser: UserProfile;
  tickets: TechTicket[];
  onOpenVideoCall: () => void;
  onOpenTickets: () => void;
  onOpenManuals: () => void;
}

export const EurotechDashboard: React.FC<EurotechDashboardProps> = ({
  currentUser,
  tickets,
  onOpenVideoCall,
  onOpenTickets,
  onOpenManuals,
}) => {
  const activeTickets = tickets.filter((t) => t.status !== 'resolved');

  return (
    <div className="flex-1 p-6 bg-slate-950 text-white overflow-y-auto space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-blue-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs px-3 py-1 rounded-full font-bold">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>(주)유로테크 - Wallpen Official Korea Distributor</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              안녕하세요, {currentUser.name}님!
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Wallpen 독일 본사 직통 AI 동시통역 화상회의 시스템 및 한국 총판 종합 관리 포털입니다. 독일 본사와 언어 장벽 없이 수주, 기술지원 및 A/S 건을 원스톱으로 처리할 수 있습니다.
            </p>
          </div>

          <button
            onClick={onOpenVideoCall}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg flex items-center space-x-2.5 transition-all transform hover:scale-[1.02] shrink-0"
          >
            <Video className="w-5 h-5 text-emerald-100 animate-pulse" />
            <span>독일 본사 직통 화상회의 시작 (AI 동시통역)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">한국 내 보급 장비 수</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white font-mono">42</span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +5대 수주 예정
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Wallpen E2 및 E1 누적 설치 대수</p>
        </div>

        {/* Stat 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">본사 진행 중 A/S 티켓</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-amber-300 font-mono">
              {activeTickets.length}
            </span>
            <span className="text-xs text-amber-400 font-semibold">건 진행 중</span>
          </div>
          <p className="text-[11px] text-slate-400">독일 본사 기술팀 검토 및 부품 조율</p>
        </div>

        {/* Stat 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">순정 Eco-UV 잉크 재고</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white font-mono">180</span>
            <span className="text-xs text-slate-400 font-semibold">리터 (양호)</span>
          </div>
          <p className="text-[11px] text-slate-400">Cyan, Magenta, Yellow, Black, White</p>
        </div>

        {/* Stat 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">AI 통역 회의 완료</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-purple-300 font-mono">18</span>
            <span className="text-xs text-slate-400 font-semibold">회 기록 보관</span>
          </div>
          <p className="text-[11px] text-slate-400">자동 생성 회의 요약서 다운로드 가능</p>
        </div>
      </div>

      {/* Main Section: Technical Support Queue & Quick Manuals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Technical Tickets for Eurotech */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Wrench className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">
                독일 본사 연동 현장 기술지원 및 A/S 티켓 현황
              </h3>
            </div>
            <button
              onClick={onOpenTickets}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>전체 티켓 보기</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {tickets.map((t) => (
              <div
                key={t.id}
                onClick={onOpenTickets}
                className="bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 p-4 rounded-xl cursor-pointer transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-blue-400">
                      {t.ticketNumber}
                    </span>
                    <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-semibold">
                      {t.model}
                    </span>
                    {t.priority === 'urgent' && (
                      <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] px-2 py-0.5 rounded font-bold">
                        긴급
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">{t.updatedAt}</span>
                </div>

                <h4 className="font-bold text-sm text-slate-100">{t.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2">{t.description}</p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>고객사: {t.customerName || '유로테크 고객'}</span>
                  <span className="text-amber-300 font-semibold">
                    담당: {t.assignee?.name || '본사 배정 중'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Quick Technical Specs & Manuals Access */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-white text-base">Wallpen 공식 매뉴얼</h3>
            </div>
            <button
              onClick={onOpenManuals}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>전체 문서</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-blue-400 font-bold">Wallpen E2 수직 레일 설치 가이드 v2.8</span>
              <p className="text-slate-400 text-[11px]">
                한국 현장 3미터 이상 수직 조립 및 트랙 레이저 정밀도 0.1mm 유지 표준.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-amber-400 font-bold">Z축 레이저 감지 센서 보정표</span>
              <p className="text-slate-400 text-[11px]">
                타일, 노출 콘크리트, 유광 벽면 대응 센서 반응속도 및 안전 차단 거리 세팅.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-emerald-400 font-bold">에코 UV 잉크 한국 보관 기준</span>
              <p className="text-slate-400 text-[11px]">
                여름철 고온 다습 기후 대응 잉크 가열 노즐 온도 42°C 표준 가이드.
              </p>
            </div>
          </div>

          <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded-xl text-xs space-y-2">
            <div className="flex items-center space-x-2 text-blue-300 font-bold">
              <Globe2 className="w-4 h-4 text-blue-400" />
              <span>독일 본사 화상 회의 예약</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              KST 16:00 (독일 CET 09:00) 본사 영업 및 R&D 엔지니어 정기 세션
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
