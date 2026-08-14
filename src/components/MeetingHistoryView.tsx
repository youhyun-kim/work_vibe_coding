import React, { useState } from 'react';
import { MeetingRecord } from '../types';
import { getSpeakerInfo } from '../utils/speakerUtils';
import { KOREA_FLAG_AVATAR, GERMANY_FLAG_AVATAR } from '../data/mockData';
import {
  FileText,
  Sparkles,
  Download,
  Calendar,
  Search,
  ChevronRight,
  ShieldCheck,
  Trash2,
  Lock,
  Clock,
  RefreshCw,
  Copy,
  Check,
  Share2,
  Send,
  Building2,
} from 'lucide-react';

interface MeetingHistoryViewProps {
  customMeetings?: MeetingRecord[];
}

export const MeetingHistoryView: React.FC<MeetingHistoryViewProps> = ({
  customMeetings = [],
}) => {
  // Use custom meetings only, sorted by date (newest first)
  const allMeetings = customMeetings;
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(allMeetings[0]?.id || null);

  // Keep selected meeting in sync with customMeetings
  const selectedMeeting = allMeetings.find((m) => m.id === selectedMeetingId) || allMeetings[0] || null;
  const [searchTerm, setSearchTerm] = useState('');
  
  // Track copied feedback state (section key name)
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Track IDs of meetings whose raw transcript has been purged according to the retention policy
  const [purgedMeetingIds, setPurgedMeetingIds] = useState<Set<string>>(new Set());

  const [retentionDays, setRetentionDays] = useState<number>(7);

  const togglePurgeMeeting = (id: string) => {
    setPurgedMeetingIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCopyText = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => {
      setCopiedSection(null);
    }, 2000);
  };

  const filteredMeetings = allMeetings.filter(
    (m) =>
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.summaryKo?.includes(searchTerm)
  );

  // Helper formatting for Teams/Email full summary copy
  const getFullTeamsFormat = (m: MeetingRecord) => {
    const isPurged = purgedMeetingIds.has(m.id);
    const decisionsText = m.technicalDecisions?.map((d) => `• ${d}`).join('\n') || '• 없음';
    const actionsText = m.actionItems?.map((a) => `• [${a.assignee}] ${a.task} (기한: ${a.dueDate})`).join('\n') || '• 없음';

    return `==================================================
[유로테크 x Wallpen 본사 AI 회의 요약 & 업무 공유]
==================================================
📌 회의명: ${m.title}
📅 일시: ${m.date} (${m.duration})
👥 참석자: ${m.participants.join(', ')}
보유 상태: ${isPurged ? `요약본 보관 중 (원문 파기 완료)` : `원본 자막 및 요약 보유 중`}

1. 🇰🇷 한국어 핵심 요약 (Korean Summary)
${m.summaryKo || 'N/A'}

2. 🇩🇪/🇬🇧 영문 요약 (English Summary)
${m.summaryEn || 'N/A'}

3. 🔧 주요 기술적 합의 및 확정 사항 (Technical Decisions)
${decisionsText}

4. 📌 후속 조치 및 추진 과제 (Action Items)
${actionsText}

==================================================
* 본 공유 문서는 유로테크 AI 통역 시스템에서 자동 생성되었습니다.
`;
  };

  const downloadReportText = (meeting: MeetingRecord) => {
    const isPurged = purgedMeetingIds.has(meeting.id);

    const transcriptSection = isPurged
      ? `[SECURITY NOTICE] Real-time audio and original raw transcript data purged after ${retentionDays}-day retention period.\nOnly verified AI Summaries, Key Discussion Topics, and Action Items are retained.`
      : meeting.transcript
          .map(
            (m) =>
              `[${m.timestamp}] ${m.speakerName} (${m.company === 'eurotech_korea' ? '유로테크' : 'Wallpen HQ'}):\nOriginal: ${m.originalText}\nTranslated: ${m.translatedText}\n`
          )
          .join('\n');

    const reportContent = `
===================================================================
EUROTECH KOREA - WALLPEN GERMANY HQ AI VIDEO CONFERENCE RECORD
===================================================================
Meeting Title: ${meeting.title}
Date & Time: ${meeting.date}
Duration: ${meeting.duration}
Participants: ${meeting.participants.join(', ')}
Retention Status: ${isPurged ? `SUMMARY ONLY (Raw Transcript Purged after ${retentionDays} Days)` : 'ACTIVE (Raw Transcript Retained)'}

-------------------------------------------------------------------
1. KOREAN EXECUTIVE SUMMARY (한국어 요약)
-------------------------------------------------------------------
${meeting.summaryKo || 'N/A'}

-------------------------------------------------------------------
2. ENGLISH EXECUTIVE SUMMARY
-------------------------------------------------------------------
${meeting.summaryEn || 'N/A'}

-------------------------------------------------------------------
3. KEY DISCUSSION TOPICS (주요 논의 사항)
-------------------------------------------------------------------
${meeting.keyTopics?.map((t) => `- [${t.topicKo} / ${t.topicEn}]: ${t.details}`).join('\n') || 'N/A'}

-------------------------------------------------------------------
4. TECHNICAL DECISIONS (기술적 결정 사항)
-------------------------------------------------------------------
${meeting.technicalDecisions?.map((d) => `• ${d}`).join('\n') || 'N/A'}

-------------------------------------------------------------------
5. ACTION ITEMS (후속 추진 과제)
-------------------------------------------------------------------
${meeting.actionItems?.map((a) => `• [${a.assignee}] ${a.task} (Due: ${a.dueDate})`).join('\n') || 'N/A'}

-------------------------------------------------------------------
6. SIMULTANEOUS TRANSLATION LOG (실시간 동시통역 원문 및 번역문)
-------------------------------------------------------------------
${transcriptSection}
===================================================================
Generated by Eurotech-Wallpen Connect AI Engine (Retention Policy Enforced)
`;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Eurotech_Wallpen_Meeting_Summary_${meeting.id}.txt`;
    a.click();
  };

  return (
    <div className="flex-1 p-6 bg-slate-950 text-white overflow-y-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-bold text-white">
              유로테크 전용 AI 회의록 & 요약 아카이브
            </h1>
            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
              총판 전용 보안 보관함
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            일자별 회의 요약, STT 동시통역 원문 및 MS 팀즈/이메일 전송용 각 꼭지별 간편 복사 지원
          </p>
        </div>

        {/* Policy Setting Indicator */}
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center space-x-3 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <span>데이터 파기 정책 가동 중</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded font-mono">
                {retentionDays}일 자동 삭제
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              회의록 요약만 영구 보관되며 원본 자막 로그는 일정 기간 후 파기
            </p>
          </div>
        </div>
      </div>

      {/* Security Retention Policy Notice Banner */}
      <div className="bg-blue-950/40 border border-blue-800/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-500/20 p-2 rounded-xl text-blue-400 shrink-0 mt-0.5">
            <Lock className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <div className="font-bold text-blue-200 flex items-center gap-2">
              <span>보안 규정 및 원데이터 파기 방침 안내</span>
              <span className="text-[10px] bg-blue-900/80 text-blue-300 px-2 py-0.5 rounded border border-blue-700/50">
                보안 가이드라인 준수
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              본 보관함은 회의 핵심 요약(Executive Summary), 기술적 결정사항 및 추진 과제(Action Items)만 모아 보관합니다.
              통화 중 생성된 원본 실시간 자막 및 음성 데이터는 <strong className="text-amber-300">{retentionDays}일 경과 후 자동 삭제</strong> 처리되어 기밀 유출을 방지합니다.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
          <span className="text-[11px] text-slate-400">보유 기간 설정:</span>
          <select
            value={retentionDays}
            onChange={(e) => setRetentionDays(Number(e.target.value))}
            className="bg-slate-900 border border-slate-700 rounded-lg text-xs px-2.5 py-1 text-amber-300 font-bold focus:outline-none"
          >
            <option value={3}>3일 후 원본 파기</option>
            <option value={7}>7일 후 원본 파기 (기본)</option>
            <option value={14}>14일 후 원본 파기</option>
            <option value={30}>30일 후 원본 파기</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Meetings List (Chronological Order) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              일자별 회의 기록 ({filteredMeetings.length}건)
            </span>
            <span className="text-[10px] font-mono text-amber-300">최신순 정렬</span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="회의 제목, 키워드 검색..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            {filteredMeetings.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-200">저장된 회의록이 없습니다</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    화상회의 종료 후 생성된 AI 요약서가 여기에 기록됩니다.
                  </p>
                </div>
              </div>
            ) : (
              filteredMeetings.map((m) => {
              const isSelected = selectedMeeting?.id === m.id;
              const isPurged = purgedMeetingIds.has(m.id);

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMeetingId(m.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 relative ${
                    isSelected
                      ? 'bg-blue-950/60 border-blue-600 shadow-xl ring-1 ring-blue-500/40'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-mono font-bold text-amber-300">
                      <Calendar className="w-3 h-3 text-blue-400" />
                      {m.date}
                    </span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-semibold">
                      {m.duration}
                    </span>
                  </div>

                  <h3 className="font-bold text-xs text-slate-100 line-clamp-2">{m.title}</h3>

                  <div className="flex items-center justify-between text-[10px] pt-1">
                    {isPurged ? (
                      <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                        <Trash2 className="w-3 h-3 text-rose-400" />
                        원본 파기됨 (요약 보관)
                      </span>
                    ) : (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        원본 보유 중 ({retentionDays}일 후 삭제)
                      </span>
                    )}

                    <span className="text-blue-400 font-bold flex items-center gap-1">
                      <span>상세 보기</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
              })
            )}
          </div>
        </div>

        {/* Right 2 Cols: Detailed AI Summary & Copy Utilities */}
        {selectedMeeting ? (
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            {/* Report Header & Full Teams Copy Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" /> Gemini 3.6 AI 요약서
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{selectedMeeting.date}</span>
                  
                  {purgedMeetingIds.has(selectedMeeting.id) ? (
                    <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3 text-rose-400" /> 원본 자막 파기 완료
                    </span>
                  ) : (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> 원본 보관 중
                    </span>
                  )}
                </div>
                <h2 className="text-base font-bold text-white">{selectedMeeting.title}</h2>
              </div>

              {/* Header Quick Actions */}
              <div className="flex items-center space-x-2 shrink-0 flex-wrap gap-y-1">
                {/* One-click Full Copy for Teams/Email */}
                <button
                  onClick={() =>
                    handleCopyText(getFullTeamsFormat(selectedMeeting), 'full_report')
                  }
                  className={`text-xs px-3.5 py-2 rounded-xl font-bold flex items-center space-x-1.5 transition-all shadow-md ${
                    copiedSection === 'full_report'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  {copiedSection === 'full_report' ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>팀즈/메일 양식 복사완료!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-white" />
                      <span>팀즈/메일용 전체 복사</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => downloadReportText(selectedMeeting)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-3 py-2 rounded-xl flex items-center space-x-1 transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>TXT</span>
                </button>
              </div>
            </div>

            {/* Summaries & Section-by-Section Copy Utility */}
            <div className="space-y-4 text-xs">
              {/* Korean Summary Section */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    🇰🇷 한국어 핵심 요약 (Korean Summary)
                  </span>
                  <button
                    onClick={() =>
                      handleCopyText(
                        `[유로테크 x Wallpen 한국어 요약]\n📌 ${selectedMeeting.title} (${selectedMeeting.date})\n\n${selectedMeeting.summaryKo}`,
                        'summaryKo'
                      )
                    }
                    className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center space-x-1 font-semibold transition-all ${
                      copiedSection === 'summaryKo'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {copiedSection === 'summaryKo' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>복사됨</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>복사 (팀즈/메일용)</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-slate-200 leading-relaxed font-medium pt-1">
                  {selectedMeeting.summaryKo}
                </p>
              </div>

              {/* English Summary Section */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                    🇩🇪/🇬🇧 English/German Executive Summary
                  </span>
                  <button
                    onClick={() =>
                      handleCopyText(
                        `[Eurotech x Wallpen HQ Summary]\n📌 ${selectedMeeting.title} (${selectedMeeting.date})\n\n${selectedMeeting.summaryEn}`,
                        'summaryEn'
                      )
                    }
                    className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center space-x-1 font-semibold transition-all ${
                      copiedSection === 'summaryEn'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {copiedSection === 'summaryEn' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>복사됨</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>복사 (팀즈/메일용)</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-slate-200 leading-relaxed font-medium pt-1">
                  {selectedMeeting.summaryEn}
                </p>
              </div>

              {/* Technical Decisions Section */}
              {selectedMeeting.technicalDecisions && selectedMeeting.technicalDecisions.length > 0 && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                      🔧 주요 기술적 합의 및 확정 사항 (Technical Decisions)
                    </span>
                    <button
                      onClick={() =>
                        handleCopyText(
                          `[유로테크 x Wallpen 기술적 결정사항]\n📌 ${selectedMeeting.title} (${selectedMeeting.date})\n\n` +
                            selectedMeeting.technicalDecisions!.map((d) => `• ${d}`).join('\n'),
                          'technicalDecisions'
                        )
                      }
                      className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center space-x-1 font-semibold transition-all ${
                        copiedSection === 'technicalDecisions'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {copiedSection === 'technicalDecisions' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>복사됨</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>복사</span>
                        </>
                      )}
                    </button>
                  </div>
                  <ul className="list-disc list-inside text-slate-200 space-y-1 font-medium pt-1">
                    {selectedMeeting.technicalDecisions.map((dec, i) => (
                      <li key={i}>{dec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Items Section */}
              {selectedMeeting.actionItems && selectedMeeting.actionItems.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-200 text-sm">
                      📌 후속 조치 및 과제 (Action Items)
                    </h4>
                    <button
                      onClick={() =>
                        handleCopyText(
                          `[유로테크 x Wallpen 후속 과제 (Action Items)]\n📌 ${selectedMeeting.title} (${selectedMeeting.date})\n\n` +
                            selectedMeeting.actionItems!.map((a) => `• [${a.assignee}] ${a.task} (기한: ${a.dueDate})`).join('\n'),
                          'actionItems'
                        )
                      }
                      className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center space-x-1 font-semibold transition-all ${
                        copiedSection === 'actionItems'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {copiedSection === 'actionItems' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>복사됨</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>복사</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {selectedMeeting.actionItems.map((a, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-amber-300 mr-2">[{a.assignee}]</span>
                          <span className="text-slate-200 font-medium">{a.task}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          기한: {a.dueDate}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STT & Simultaneous Transcript Log vs Purged Security Notice */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                    💬 실시간 동시통역 STT 및 원문 자막 로그
                  </h4>

                  {!purgedMeetingIds.has(selectedMeeting.id) && (
                    <button
                      onClick={() =>
                        handleCopyText(
                          `[유로테크 x Wallpen 실시간 STT 통역 대화 로그]\n📌 ${selectedMeeting.title} (${selectedMeeting.date})\n\n` +
                            selectedMeeting.transcript
                              .map((m) => {
                                const info = getSpeakerInfo(m.company, m.speakerName);
                                return `[${m.timestamp}] ${info.flag} ${m.speakerName} (${info.companyLabel}):\n원문: ${m.originalText}\n번역: ${m.translatedText}\n`;
                              })
                              .join('\n'),
                          'transcript'
                        )
                      }
                      className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center space-x-1 font-semibold transition-all ${
                        copiedSection === 'transcript'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {copiedSection === 'transcript' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>로그 복사됨</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>STT 대화 전체 복사</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {purgedMeetingIds.has(selectedMeeting.id) ? (
                  /* Purged State Notice Box */
                  <div className="bg-slate-950 p-6 rounded-2xl border border-rose-900/40 text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-200 text-sm">
                        🔒 원본 실시간 대화 자막 데이터 파기 완료
                      </h5>
                      <p className="text-slate-400 text-xs mt-1 max-w-lg mx-auto leading-relaxed">
                        개인정보 보호 및 사내 기밀 보안 정책({retentionDays}일 보관 규정)에 따라 원본 실시간 음성/자막 데이터는 파기 삭제되었습니다.
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] text-amber-300 font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>검증된 Gemini AI 회의 요약서 및 추진 과제는 안전하게 유지됩니다.</span>
                    </div>
                  </div>
                ) : (
                  /* Active Transcript Box with Flag & Speaker Color Differentiation */
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 max-h-80 overflow-y-auto space-y-3">
                    {selectedMeeting.transcript.map((m) => {
                      const info = getSpeakerInfo(m.company, m.speakerName);
                      return (
                        <div
                          key={m.id}
                          className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${info.boxStyle}`}
                        >
                          <div className="flex items-center justify-between text-[11px] text-slate-300">
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 rounded-full overflow-hidden ring-1 ring-slate-600 shrink-0 bg-white flex items-center justify-center shadow-sm">
                                <img
                                  src={m.company === 'eurotech_korea' ? KOREA_FLAG_AVATAR : GERMANY_FLAG_AVATAR}
                                  alt={m.speakerName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className={`font-bold ${info.nameColor}`}>
                                {m.speakerName}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${info.badgeStyle}`}
                              >
                                {info.companyLabel}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">{m.timestamp}</span>
                          </div>
                          <p className="text-slate-100 font-medium pl-1">{m.originalText}</p>
                          <p className="text-amber-300 font-bold border-t border-slate-700/60 pt-1.5 pl-1 flex items-start gap-1">
                            <span className="text-amber-400 shrink-0">➜</span>
                            <span>{m.translatedText}</span>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Simulation Utility Row */}
              <div className="pt-2 flex items-center justify-end">
                <button
                  onClick={() => togglePurgeMeeting(selectedMeeting.id)}
                  className="text-[10px] text-slate-500 hover:text-slate-400 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>[보안 시뮬레이션] 원본 자막 파기/복원 토글</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center space-y-3 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
              <Sparkles className="w-7 h-7 text-amber-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-200">선택된 회의 요약서가 없습니다</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                화상회의를 진행한 후 [Gemini 회의록 AI 요약 생성]을 완료하면 일자별 회의 요약과 후속 과제가 여기에 표시됩니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

