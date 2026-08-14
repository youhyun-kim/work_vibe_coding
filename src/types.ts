export type CompanyType = 'eurotech_korea' | 'wallpen_germany';

export type UserRole =
  | 'eurotech_manager'
  | 'eurotech_engineer'
  | 'wallpen_director'
  | 'wallpen_tech_lead'
  | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  nameKr?: string;
  email: string;
  company: CompanyType;
  companyName: string;
  role: UserRole;
  roleTitle: string;
  roleTitleKr?: string;
  avatar: string;
  department: string;
  preferredLang: 'ko' | 'de' | 'en';
  location: string;
  timezone: string; // e.g. "Asia/Seoul" or "Europe/Berlin"
  status: 'online' | 'busy' | 'in_meeting' | 'offline';
}

export type MainViewTab =
  | 'video_conference'
  | 'dashboard'
  | 'tech_tickets'
  | 'manuals'
  | 'meeting_history'
  | 'orders_inventory';

export interface SubtitleMessage {
  id: string;
  speakerId: string;
  speakerName: string;
  company: CompanyType;
  originalText: string;
  originalLang: 'ko' | 'de' | 'en';
  translatedText: string;
  translatedLang: 'ko' | 'de' | 'en';
  timestamp: string;
  isImportant?: boolean;
  technicalTerm?: string;
}

export interface VideoParticipant {
  id: string;
  user: UserProfile;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeaking: boolean;
  isHost: boolean;
  screenSharing: boolean;
  handRaised: boolean;
  currentLanguage: 'ko' | 'de' | 'en';
  videoPresetUrl?: string;
}

export interface TechTicket {
  id: string;
  ticketNumber: string;
  title: string;
  titleKr?: string;
  model: 'Wallpen E2' | 'Wallpen E1' | 'Wallpen Portable' | 'Wallpen Software';
  printerSerial?: string;
  customerName?: string; // Korean end-customer
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_review' | 'waiting_hq_parts' | 'resolved';
  createdAt: string;
  updatedAt: string;
  reporter: {
    name: string;
    company: CompanyType;
  };
  assignee?: {
    name: string;
    company: CompanyType;
  };
  description: string;
  symptoms: string[];
  commentsCount: number;
}

export interface MeetingRecord {
  id: string;
  title: string;
  date: string;
  duration: string;
  hostCompany: CompanyType;
  participants: string[];
  transcript: SubtitleMessage[];
  summaryKo?: string;
  summaryEn?: string;
  keyTopics?: { topicKo: string; topicEn: string; details: string }[];
  technicalDecisions?: string[];
  actionItems?: { assignee: string; task: string; dueDate: string }[];
  downloadUrl?: string;
}

export interface WallpenManualItem {
  id: string;
  category: 'Hardware & Assembly' | 'UV Ink & Printing' | 'Calibration & Lasers' | 'Software & RIP';
  title: string;
  titleKr: string;
  version: string;
  fileSize: string;
  updatedDate: string;
  descriptionKo: string;
  descriptionEn: string;
  downloadUrl?: string;
}

export interface WhiteboardElement {
  id: string;
  type: 'pencil' | 'line' | 'rectangle' | 'circle' | 'text' | 'wallpen_stencil';
  points?: { x: number; y: number }[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color: string;
  size: number;
  text?: string;
}
