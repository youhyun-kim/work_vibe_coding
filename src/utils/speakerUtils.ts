export interface SpeakerInfo {
  flag: string;
  companyLabel: string;
  boxStyle: string;
  badgeStyle: string;
  borderLeftStyle: string;
  isKorea: boolean;
  avatarBg: string;
  nameColor: string;
}

export function getSpeakerInfo(company?: string, speakerName: string = ''): SpeakerInfo {
  const isKorea =
    company === 'eurotech_korea' ||
    speakerName.includes('지충근') ||
    speakerName.includes('김한빈') ||
    speakerName.includes('김민준') ||
    speakerName.includes('박진우') ||
    speakerName.includes('유로테크') ||
    speakerName.includes('대표') ||
    speakerName.includes('과장') ||
    speakerName.includes('팀장') ||
    speakerName.includes('대리');

  const flag = isKorea ? '🇰🇷' : '🇩🇪';
  const companyLabel = isKorea ? '유로테크' : 'Wallpen HQ';

  // Distinct colors per speaker
  if (speakerName.includes('지충근') || speakerName.includes('김민준')) {
    return {
      flag,
      companyLabel,
      boxStyle: 'bg-blue-950/70 border-blue-700/80 border-l-4 border-l-blue-400 shadow-md',
      badgeStyle: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      borderLeftStyle: 'border-l-4 border-l-blue-400',
      isKorea: true,
      avatarBg: 'bg-blue-600',
      nameColor: 'text-blue-300',
    };
  }

  if (speakerName.includes('김한빈') || speakerName.includes('박진우')) {
    return {
      flag,
      companyLabel,
      boxStyle: 'bg-teal-950/70 border-teal-700/80 border-l-4 border-l-teal-400 shadow-md',
      badgeStyle: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
      borderLeftStyle: 'border-l-4 border-l-teal-400',
      isKorea: true,
      avatarBg: 'bg-teal-600',
      nameColor: 'text-teal-300',
    };
  }

  if (speakerName.includes('Hans') || speakerName.includes('한스') || speakerName.includes('Müller') || speakerName.includes('뮬러')) {
    return {
      flag,
      companyLabel,
      boxStyle: 'bg-amber-950/60 border-amber-700/80 border-l-4 border-l-amber-400 shadow-md',
      badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      borderLeftStyle: 'border-l-4 border-l-amber-400',
      isKorea: false,
      avatarBg: 'bg-amber-600',
      nameColor: 'text-amber-300',
    };
  }

  if (speakerName.includes('Stefan') || speakerName.includes('슈테판') || speakerName.includes('Weber') || speakerName.includes('베버')) {
    return {
      flag,
      companyLabel,
      boxStyle: 'bg-purple-950/70 border-purple-700/80 border-l-4 border-l-purple-400 shadow-md',
      badgeStyle: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      borderLeftStyle: 'border-l-4 border-l-purple-400',
      isKorea: false,
      avatarBg: 'bg-purple-600',
      nameColor: 'text-purple-300',
    };
  }

  // Fallback by company
  if (isKorea) {
    return {
      flag,
      companyLabel,
      boxStyle: 'bg-blue-950/60 border-blue-700/80 border-l-4 border-l-blue-400 shadow-md',
      badgeStyle: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      borderLeftStyle: 'border-l-4 border-l-blue-400',
      isKorea: true,
      avatarBg: 'bg-blue-600',
      nameColor: 'text-blue-300',
    };
  }

  return {
    flag,
    companyLabel,
    boxStyle: 'bg-indigo-950/60 border-indigo-700/80 border-l-4 border-l-indigo-400 shadow-md',
    badgeStyle: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    borderLeftStyle: 'border-l-4 border-l-indigo-400',
    isKorea: false,
    avatarBg: 'bg-indigo-600',
    nameColor: 'text-indigo-300',
  };
}
