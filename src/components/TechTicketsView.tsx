import React, { useState } from 'react';
import { UserProfile, TechTicket } from '../types';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquare,
  Building2,
  Send,
  X,
  Sparkles,
} from 'lucide-react';

interface TechTicketsViewProps {
  currentUser: UserProfile;
  tickets: TechTicket[];
  onAddTicket: (newTicket: TechTicket) => void;
}

export const TechTicketsView: React.FC<TechTicketsViewProps> = ({
  currentUser,
  tickets,
  onAddTicket,
}) => {
  const isEurotech = currentUser.company === 'eurotech_korea';
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New ticket form state
  const [newTitle, setNewTitle] = useState('');
  const [newModel, setNewModel] = useState<'Wallpen E2' | 'Wallpen E1' | 'Wallpen Portable' | 'Wallpen Software'>('Wallpen E2');
  const [newSerial, setNewSerial] = useState('');
  const [newCustomer, setNewCustomer] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('high');
  const [newDesc, setNewDesc] = useState('');

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const ticket: TechTicket = {
      id: `tck_${Date.now()}`,
      ticketNumber: `WP-KR-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: newTitle,
      model: newModel,
      printerSerial: newSerial || 'WPE2-2026-KR099',
      customerName: newCustomer || '한국 유로테크 지정 고객사',
      priority: newPriority,
      status: 'open',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      reporter: {
        name: currentUser.name,
        company: currentUser.company,
      },
      description: newDesc,
      symptoms: ['현장 레이저 센서 오차 감지', '독일 본사 R&D 피드백 요청'],
      commentsCount: 1,
    };

    onAddTicket(ticket);
    setShowCreateModal(false);
    setNewTitle('');
    setNewDesc('');
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && t.status === filterStatus;
  });

  return (
    <div className="flex-1 p-6 bg-slate-950 text-white overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Wrench className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-bold text-white">
              {isEurotech ? '유로테크 ↔ 독일 본사 A/S & 기술지원 티켓' : 'Wallpen Korea Support Ticket Portal'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Wallpen 수직 프린터 레이저 센서, UV 잉크, 펌웨어 및 하드웨어 이상 조율 데스크
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>신규 기술지원 티켓 등록</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="티켓 번호, 현장 증상, 장비 시리얼 검색..."
            className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="all">전체 상태 보기</option>
            <option value="open">신규 접수 (Open)</option>
            <option value="in_review">본사 검토 중 (In Review)</option>
            <option value="waiting_hq_parts">독일 본사 부품 발송 대기</option>
            <option value="resolved">조치 완료 (Resolved)</option>
          </select>
        </div>
      </div>

      {/* Tickets Cards List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
              <Wrench className="w-6 h-6 text-amber-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-200">등록된 기술지원 티켓이 없습니다</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                필요 시 상단의 [+ 신규 A/S 티켓 발행] 버튼을 눌러 독일 본사 기술지원 건을 등록할 수 있습니다.
              </p>
            </div>
          </div>
        ) : (
          filteredTickets.map((t) => (
          <div
            key={t.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center space-x-2.5">
                <span className="font-mono font-bold text-sm text-blue-400">{t.ticketNumber}</span>
                <span className="bg-slate-800 text-slate-200 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-slate-700">
                  {t.model}
                </span>
                <span className="text-xs text-slate-400 font-mono">S/N: {t.printerSerial}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                    t.status === 'resolved'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : t.status === 'in_review'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {t.status === 'open' && '신규 접수'}
                  {t.status === 'in_review' && '독일 본사 검토 중'}
                  {t.status === 'waiting_hq_parts' && '본사 부품 발송 진행 중'}
                  {t.status === 'resolved' && '해결 완료'}
                </span>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    t.priority === 'urgent'
                      ? 'bg-rose-600 text-white'
                      : t.priority === 'high'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {t.priority}
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-100">{t.title}</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{t.description}</p>
            </div>

            {/* Symptoms Tags */}
            {t.symptoms && t.symptoms.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {t.symptoms.map((s, i) => (
                  <span
                    key={i}
                    className="bg-slate-950 text-slate-400 border border-slate-800 text-[10px] px-2 py-0.5 rounded"
                  >
                    • {s}
                  </span>
                ))}
              </div>
            )}

            {/* Ticket Footer Meta */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
              <div className="flex items-center space-x-4">
                <span>등록자: <strong className="text-slate-200">{t.reporter.name}</strong></span>
                <span>본사 담당: <strong className="text-amber-300">{t.assignee?.name || '독일 본사 배정 완료'}</strong></span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                  <span>댓글 {t.commentsCount}개</span>
                </span>
                <span className="text-[11px] font-mono">{t.updatedAt}</span>
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      {/* Modal for Creating New Ticket */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">
                  신규 Wallpen 기술지원 / A/S 티켓 발행
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  티켓 제목 (증상 요약)
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="예: 성수동 현장 Wallpen E2 Z축 레이저 센서 오차 감지 건"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">장비 모델</label>
                  <select
                    value={newModel}
                    onChange={(e: any) => setNewModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Wallpen E2">Wallpen E2</option>
                    <option value="Wallpen E1">Wallpen E1</option>
                    <option value="Wallpen Portable">Wallpen Portable</option>
                    <option value="Wallpen Software">Wallpen Software</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">우선순위</label>
                  <select
                    value={newPriority}
                    onChange={(e: any) => setNewPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="urgent">Urgent (긴급 현장)</option>
                    <option value="high">High (높음)</option>
                    <option value="medium">Medium (보통)</option>
                    <option value="low">Low (일반)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  장비 시리얼 번호 & 한국 현장 고객사
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newSerial}
                    onChange={(e) => setNewSerial(e.target.value)}
                    placeholder="WPE2-2026-KR099"
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newCustomer}
                    onChange={(e) => setNewCustomer(e.target.value)}
                    placeholder="현장 인테리어업체 명"
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  상세 증상 및 독일 본사 요청사항
                </label>
                <textarea
                  rows={4}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="현장 벽면 재질, 레이저 오프셋 설정값, 사용 잉크 차수 및 발생 에러코드(E-204 등) 기재..."
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl shadow-md"
                >
                  티켓 발행 및 본사 전송
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
