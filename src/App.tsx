import React, { useState } from 'react';
import { UserProfile, MainViewTab, TechTicket, MeetingRecord, SubtitleMessage } from './types';
import { MOCK_USERS, MOCK_TICKETS, MOCK_MEETINGS } from './data/mockData';
import { Header } from './components/Header';
import { SidebarNav } from './components/SidebarNav';
import { VideoConferenceView } from './components/VideoConferenceView';
import { EurotechDashboard } from './components/EurotechDashboard';
import { WallpenHQDashboard } from './components/WallpenHQDashboard';
import { TechTicketsView } from './components/TechTicketsView';
import { ManualsView } from './components/ManualsView';
import { MeetingHistoryView } from './components/MeetingHistoryView';
import { LoginModal } from './components/LoginModal';

export default function App() {
  // Current logged in user profile (Default: Eurotech Korea Manager)
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USERS[0]);

  // Main view tab state
  const [currentTab, setCurrentTab] = useState<MainViewTab>('video_conference');

  // Interactive datasets
  const [tickets, setTickets] = useState<TechTicket[]>(MOCK_TICKETS);
  const [meetings, setMeetings] = useState<MeetingRecord[]>(MOCK_MEETINGS);

  // Video call active state
  const [isCallActive, setIsCallActive] = useState<boolean>(true);

  // Login modal switcher
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  const handleAddTicket = (newTicket: TechTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
  };

  const handleSaveMeetingRecord = (transcript: SubtitleMessage[], report: any) => {
    const newMeeting: MeetingRecord = {
      id: `mtg_${Date.now()}`,
      title: `${currentUser.companyName} AI 동시통역 화상회의 세션`,
      date: new Date().toLocaleString(),
      duration: '실시간 기록 완료',
      hostCompany: currentUser.company,
      participants: [currentUser.name, 'Wallpen Germany HQ Engineer'],
      transcript,
      summaryKo: report.summaryKo || 'Gemini AI 자동 생성 요약서',
      summaryEn: report.summaryEn || 'Gemini AI Generated Executive Summary',
      keyTopics: report.keyTopics || [],
      technicalDecisions: report.technicalDecisions || [],
      actionItems: report.actionItems || [],
    };

    setMeetings((prev) => [newMeeting, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Global Header */}
      <Header
        currentUser={currentUser}
        onSwitchUser={() => setShowLoginModal(true)}
        onOpenVideoCall={() => {
          setCurrentTab('video_conference');
          setIsCallActive(true);
        }}
        isCallActive={isCallActive}
      />

      {/* Main Container Layout with Permanent Sidebar Navigation */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <SidebarNav
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            if (tab === 'video_conference') {
              setIsCallActive(true);
            }
          }}
          currentUser={currentUser}
          onSwitchUser={() => setShowLoginModal(true)}
          unreadTicketsCount={tickets.filter((t) => t.status !== 'resolved').length}
        />

        {/* Active View Router */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {currentTab === 'video_conference' && (
            <VideoConferenceView
              currentUser={currentUser}
              onEndCall={() => {
                setIsCallActive(false);
                if (currentUser.company === 'eurotech_korea') {
                  setCurrentTab('meeting_history');
                }
              }}
              onSaveMeetingRecord={handleSaveMeetingRecord}
            />
          )}

          {currentTab === 'meeting_history' &&
            (currentUser.company === 'eurotech_korea' ? (
              <MeetingHistoryView customMeetings={meetings} />
            ) : (
              <VideoConferenceView
                currentUser={currentUser}
                onEndCall={() => setIsCallActive(false)}
                onSaveMeetingRecord={handleSaveMeetingRecord}
              />
            ))}
        </main>
      </div>

      {/* Account Login / Role Switcher Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        currentUser={currentUser}
        onSelectUser={(u) => {
          setCurrentUser(u);
          if (u.company === 'wallpen_germany') {
            setCurrentTab('video_conference');
            setIsCallActive(true);
          } else {
            setCurrentTab('meeting_history');
          }
        }}
      />
    </div>
  );
}
