import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserProfile, SubtitleMessage, CompanyType } from '../types';
import { MOCK_USERS, QUICK_GLOSSARY_PHRASES } from '../data/mockData';
import { getSpeakerInfo } from '../utils/speakerUtils';
import { translateOffline } from '../utils/translationEngine';
import { WhiteboardModal } from './WhiteboardModal';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Volume2,
  VolumeX,
  Languages,
  Sparkles,
  Send,
  Download,
  Share2,
  Maximize2,
  FileText,
  MessageSquare,
  Wrench,
  X,
  PhoneOff,
  Radio,
  Copy,
  Check,
  Globe2,
  User,
  AudioLines,
  AlertCircle,
  Activity,
  Square,
  Volume1,
  Settings,
  HelpCircle,
  RefreshCw,
  Play,
} from 'lucide-react';

interface VideoConferenceViewProps {
  currentUser: UserProfile;
  onEndCall: () => void;
  onSaveMeetingRecord?: (transcript: SubtitleMessage[], summary: any) => void;
}

export const VideoConferenceView: React.FC<VideoConferenceViewProps> = ({
  currentUser,
  onEndCall,
  onSaveMeetingRecord,
}) => {
  // Call participant state
  const isEurotechUser = currentUser.company === 'eurotech_korea';

  // Remote counterpart
  const remoteUser: UserProfile = isEurotechUser
    ? MOCK_USERS.find((u) => u.company === 'wallpen_germany') || MOCK_USERS[2]
    : MOCK_USERS.find((u) => u.company === 'eurotech_korea') || MOCK_USERS[0];

  // Call Media States
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isRemoteVideoOff, setIsRemoteVideoOff] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [translationDirection, setTranslationDirection] = useState<'ko_to_en' | 'ko_to_de' | 'en_to_ko' | 'de_to_ko'>(
    'ko_to_en'
  );

  // Voice Gender Selection & Real-Time Pitch Analysis
  const [selectedVoiceGender, setSelectedVoiceGender] = useState<'auto' | 'male' | 'female'>('auto');
  const [detectedVoiceGender, setDetectedVoiceGender] = useState<'male' | 'female'>('male');
  const [estimatedPitchHz, setEstimatedPitchHz] = useState<number>(125);

  // Audio & STT State
  const [micPermissionState, setMicPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isVirtualMicActive, setIsVirtualMicActive] = useState<boolean>(false);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [audioFrequencies, setAudioFrequencies] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);
  const [isAutoSttEnabled, setIsAutoSttEnabled] = useState<boolean>(true);
  const [isSpeakingActive, setIsSpeakingActive] = useState<boolean>(false);
  const [micSensitivity, setMicSensitivity] = useState<'ultra' | 'high' | 'standard'>('ultra');
  const [isRecordingManualAudio, setIsRecordingManualAudio] = useState<boolean>(false);
  const [manualRecordSeconds, setManualRecordSeconds] = useState<number>(0);
  const [sttStatusMessage, setSttStatusMessage] = useState<string>('🎙️ 마이크 권한 허용 후 실시간 음성인식이 시작됩니다.');
  const [sttErrorNotice, setSttErrorNotice] = useState<string | null>(null);

  // Messages & Subtitles State (Empty initially - No dummy data)
  const [messages, setMessages] = useState<SubtitleMessage[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState<SubtitleMessage | null>(null);
  const [liveInterimSpeech, setLiveInterimSpeech] = useState<string>('');
  const [inputManualText, setInputManualText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [hasWebcamStream, setHasWebcamStream] = useState<boolean>(false);
  const [showTranscriptDrawer, setShowTranscriptDrawer] = useState<boolean>(true);
  const [showWhiteboard, setShowWhiteboard] = useState<boolean>(false);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [aiSummaryReport, setAiSummaryReport] = useState<any | null>(null);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showMicHelpModal, setShowMicHelpModal] = useState<boolean>(false);

  // Refs for Audio & Video Pipeline
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const transcriptContainerRef = useRef<HTMLDivElement | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // MediaRecorder Refs for Audio STT
  const continuousRecorderRef = useRef<MediaRecorder | null>(null);
  const continuousChunksRef = useRef<Blob[]>([]);
  const isCurrentlySpeakingRef = useRef<boolean>(false);
  const speechStartTimestampRef = useRef<number>(0);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxSpeechTimerRef = useRef<NodeJS.Timeout | null>(null);
  const manualRecorderRef = useRef<MediaRecorder | null>(null);
  const manualChunksRef = useRef<Blob[]>([]);
  const manualTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Web Speech API fallback ref & continuous lifecycle
  const webSpeechRecognitionRef = useRef<any>(null);
  const isRecognitionRunningRef = useRef<boolean>(false);
  const restartRecognitionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const interimCommitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingInterimRef = useRef<string>('');
  const lastProcessedTextRef = useRef<{ text: string; time: number }>({ text: '', time: 0 });

  // Scroll transcript to top on new message
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = 0;
    }
  }, [messages, currentSubtitle]);

  // Available Browser Voices Cache
  const [voicesList, setVoicesList] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    const updateVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        setVoicesList(v);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Helper: Convert Blob to Base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1] || '';
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Helper: High Quality Gender-Aware Voice Synthesis (TTS)
  const speakText = useCallback(
    (text: string, langCode: string, forcedGender?: 'male' | 'female') => {
      if (!isTtsEnabled || !('speechSynthesis' in window) || !text || !text.trim()) return;
      try {
        window.speechSynthesis.cancel();

        let textToSpeak = text.replace(/\[.*?\]/g, '').trim();

        // If target language is English or German, but text still contains Korean characters, translate first!
        if ((langCode === 'en' || langCode === 'de') && /[\uAC00-\uD7AF]/.test(textToSpeak)) {
          const transResult = translateOffline(textToSpeak, 'ko', langCode as any);
          textToSpeak = transResult.translatedText || textToSpeak;
        }

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        const allVoices = voicesList.length > 0 ? voicesList : window.speechSynthesis.getVoices();

        // Determine active voice gender
        const targetGender: 'male' | 'female' =
          forcedGender ||
          (selectedVoiceGender !== 'auto' ? selectedVoiceGender : detectedVoiceGender);

        if (langCode === 'ko') {
          utterance.lang = 'ko-KR';
          const koVoice =
            targetGender === 'male'
              ? allVoices.find(
                  (v) =>
                    (v.lang === 'ko-KR' || v.lang.startsWith('ko')) &&
                    (v.name.includes('Male') ||
                      v.name.includes('Minho') ||
                      v.name.includes('InJoon') ||
                      v.name.includes('Injoon') ||
                      v.name.includes('Hyunwoo'))
                ) || allVoices.find((v) => v.lang.startsWith('ko'))
              : allVoices.find(
                  (v) =>
                    (v.lang === 'ko-KR' || v.lang.startsWith('ko')) &&
                    (v.name.includes('Female') ||
                      v.name.includes('Yuna') ||
                      v.name.includes('Heami') ||
                      v.name.includes('SunHi') ||
                      v.name.includes('Natural') ||
                      v.name.includes('Google') ||
                      v.name.includes('Korean'))
                ) || allVoices.find((v) => v.lang.startsWith('ko'));
          if (koVoice) utterance.voice = koVoice;
          utterance.pitch = targetGender === 'male' ? 0.92 : 1.05;
          utterance.rate = 1.0;
        } else if (langCode === 'de') {
          utterance.lang = 'de-DE';
          const deVoice =
            targetGender === 'male'
              ? allVoices.find(
                  (v) =>
                    (v.lang === 'de-DE' || v.lang.startsWith('de')) &&
                    (v.name.includes('Male') ||
                      v.name.includes('Stefan') ||
                      v.name.includes('Bernd') ||
                      v.name.includes('Conrad') ||
                      v.name.includes('Klaus'))
                ) || allVoices.find((v) => v.lang.startsWith('de'))
              : allVoices.find(
                  (v) =>
                    (v.lang === 'de-DE' || v.lang.startsWith('de')) &&
                    (v.name.includes('Female') ||
                      v.name.includes('Katja') ||
                      v.name.includes('Hedda') ||
                      v.name.includes('Marlene') ||
                      v.name.includes('Natural') ||
                      v.name.includes('Google') ||
                      v.name.includes('German'))
                ) || allVoices.find((v) => v.lang.startsWith('de'));
          if (deVoice) utterance.voice = deVoice;
          utterance.pitch = targetGender === 'male' ? 0.90 : 1.05;
          utterance.rate = 1.0;
        } else {
          // English (en-US) Gender-Optimized Voice Selection
          utterance.lang = 'en-US';
          let usVoice: SpeechSynthesisVoice | undefined;

          if (targetGender === 'male') {
            usVoice =
              allVoices.find(
                (v) =>
                  (v.lang === 'en-US' || v.lang.startsWith('en')) &&
                  (v.name.includes('David') ||
                    v.name.includes('Guy') ||
                    v.name.includes('Mark') ||
                    v.name.includes('George') ||
                    v.name.includes('Ryan') ||
                    v.name.includes('James') ||
                    v.name.includes('Male') ||
                    v.name.includes('Google US English Male'))
              ) || allVoices.find((v) => v.lang === 'en-US' || v.lang.startsWith('en'));
            utterance.pitch = 0.90; // Natural resonant masculine pitch
            utterance.rate = 1.0;
          } else {
            usVoice =
              allVoices.find(
                (v) =>
                  (v.lang === 'en-US' || v.lang.startsWith('en')) &&
                  (v.name.includes('Jenny') ||
                    v.name.includes('Samantha') ||
                    v.name.includes('Aria') ||
                    v.name.includes('Ava') ||
                    v.name.includes('Zira') ||
                    v.name.includes('Female') ||
                    v.name.includes('Google US English Female') ||
                    v.name.includes('Google US English'))
              ) || allVoices.find((v) => v.lang === 'en-US' || v.lang.startsWith('en'));
            utterance.pitch = 1.08; // Clear natural feminine pitch
            utterance.rate = 0.98;
          }
          if (usVoice) utterance.voice = usVoice;
        }

        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis error:', e);
      }
    },
    [isTtsEnabled, voicesList, selectedVoiceGender, detectedVoiceGender]
  );

  // Perform translation via Gemini backend API + Auxiliary + Universal Engine
  const handleTranslateAndSpeak = async (textToSpeak: string, forcedSpeaker?: UserProfile) => {
    const trimmed = textToSpeak.trim();
    if (!trimmed) return;

    // Deduplication check (prevent duplicate triggers within 1200ms)
    const now = Date.now();
    if (
      trimmed === lastProcessedTextRef.current.text &&
      now - lastProcessedTextRef.current.time < 1200
    ) {
      return;
    }
    lastProcessedTextRef.current = { text: trimmed, time: now };

    const speaker = forcedSpeaker || currentUser;
    setIsTranslating(true);

    let sourceLang = 'ko';
    let targetLang = 'en';

    if (translationDirection === 'ko_to_de') {
      sourceLang = 'ko';
      targetLang = 'de';
    } else if (translationDirection === 'ko_to_en') {
      sourceLang = 'ko';
      targetLang = 'en';
    } else if (translationDirection === 'de_to_ko') {
      sourceLang = 'de';
      targetLang = 'ko';
    } else if (translationDirection === 'en_to_ko') {
      sourceLang = 'en';
      targetLang = 'ko';
    }

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: trimmed,
          sourceLang,
          targetLang,
          context: 'Wallpen Wall Printer Tech & Order Conference (Eurotech Korea & Wallpen Germany HQ)',
        }),
      });

      const data = await res.json();
      let translatedText = data.translatedText;

      // Guarantee translation fidelity: if empty, same as input, or still contains Korean characters when translating to English
      const hasKorean = /[\uAC00-\uD7AF]/.test(translatedText || '');
      if (
        !data.success ||
        !translatedText ||
        (targetLang === 'en' && hasKorean) ||
        (sourceLang !== targetLang && translatedText.trim() === trimmed)
      ) {
        const offline = translateOffline(trimmed, sourceLang as any, targetLang as any);
        translatedText = offline.translatedText || trimmed;
      }

      const newMessage: SubtitleMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        speakerId: speaker.id,
        speakerName: speaker.name,
        company: speaker.company,
        originalText: trimmed,
        originalLang: sourceLang as any,
        translatedText,
        translatedLang: targetLang as any,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        technicalTerm: data.domainNotes || 'Wallpen System Verification',
      };

      setMessages((prev) => [...prev, newMessage]);
      setCurrentSubtitle(newMessage);
      setLiveInterimSpeech('');
      setInputManualText('');

      speakText(translatedText, targetLang);
    } catch (err) {
      console.error('Translation error:', err);
      const offline = translateOffline(trimmed, sourceLang as any, targetLang as any);
      const fallbackText = offline.translatedText || trimmed;

      const newMessage: SubtitleMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        speakerId: speaker.id,
        speakerName: speaker.name,
        company: speaker.company,
        originalText: trimmed,
        originalLang: sourceLang as any,
        translatedText: fallbackText,
        translatedLang: targetLang as any,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        technicalTerm: offline.technicalTerm || 'Wallpen Tech Terminology',
      };
      setMessages((prev) => [...prev, newMessage]);
      setCurrentSubtitle(newMessage);
      setLiveInterimSpeech('');
      setInputManualText('');
      speakText(fallbackText, targetLang);
    } finally {
      setIsTranslating(false);
    }
  };

  // Throttle ref for STT
  const lastAudioSttTimestampRef = useRef<number>(0);

  // Process recorded audio chunk with Gemini Flash Multimodal Audio STT
  const processAudioChunkWithGemini = async (audioBlob: Blob, isManual: boolean = false) => {
    if (audioBlob.size < 1200) {
      console.log('Audio blob too small, skipping:', audioBlob.size);
      return;
    }

    const now = Date.now();
    if (!isManual && now - lastAudioSttTimestampRef.current < 3500) {
      console.log('STT request throttled to protect quota');
      return;
    }
    lastAudioSttTimestampRef.current = now;

    try {
      setSttStatusMessage('🤖 AI가 음성을 분석하고 있습니다...');
      const base64 = await blobToBase64(audioBlob);

      let sourceLang = 'ko';
      let targetLang = 'en';
      if (translationDirection === 'ko_to_de') {
        sourceLang = 'ko';
        targetLang = 'de';
      } else if (translationDirection === 'ko_to_en') {
        sourceLang = 'ko';
        targetLang = 'en';
      } else if (translationDirection === 'de_to_ko') {
        sourceLang = 'de';
        targetLang = 'ko';
      } else if (translationDirection === 'en_to_ko') {
        sourceLang = 'en';
        targetLang = 'ko';
      }

      // Safe clean MIME type
      const cleanMime = (audioBlob.type || 'audio/webm').split(';')[0];

      const res = await fetch('/api/audio-stt-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64,
          mimeType: cleanMime,
          sourceLang,
          targetLang,
        }),
      });

      const data = await res.json();
      if (data.success && data.transcription && data.transcription.trim()) {
        const spokenText = data.transcription.trim();
        setLiveInterimSpeech(spokenText);
        setSttStatusMessage(`✅ AI 음성 인식 성공: "${spokenText}"`);

        let translatedText = data.translatedText;
        if (
          !translatedText ||
          (sourceLang !== targetLang && translatedText.trim() === spokenText.trim())
        ) {
          const offline = translateOffline(spokenText, sourceLang as any, targetLang as any);
          translatedText = offline.translatedText || spokenText;
        }

        const newMessage: SubtitleMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          speakerId: currentUser.id,
          speakerName: currentUser.name,
          company: currentUser.company,
          originalText: spokenText,
          originalLang: sourceLang as any,
          translatedText,
          translatedLang: targetLang as any,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          technicalTerm: data.domainNotes || 'Gemini Multimodal Audio STT',
        };

        setMessages((prev) => [...prev, newMessage]);
        setCurrentSubtitle(newMessage);
        speakText(translatedText, targetLang);

        setTimeout(() => {
          setLiveInterimSpeech('');
          setSttStatusMessage('🎤 실시간 마이크 대기 중 (말씀하시면 즉시 인식합니다)');
        }, 2000);
      } else {
        if (isManual) {
          setSttStatusMessage('💡 음성이 명확히 감지되지 않았습니다. 마이크 가까이에서 다시 말씀해주세요.');
        } else {
          setSttStatusMessage('🎤 실시간 마이크 가동 중 (말씀하시면 AI가 음성을 인식합니다)');
        }
      }
    } catch (err) {
      console.warn('Process audio chunk error:', err);
      setSttStatusMessage('마이크 음성 전송 대기 중');
    }
  };

  // Function to initialize or restart microphone stream
  const initializeAudioStream = async (isUserInitiated: boolean = false) => {
    try {
      setSttErrorNotice(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setSttErrorNotice(
          '현재 브라우저 환경에서는 직접 마이크 장치 접근이 제한되어 있습니다. [가상 마이크 / 음성 시뮬레이터] 또는 [텍스트 입력]을 사용하실 수 있습니다.'
        );
        setIsVirtualMicActive(true);
        return null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false, // Prevents swallowing soft voice
          autoGainControl: true,
        },
      });

      audioStreamRef.current = stream;
      setMicPermissionState('granted');
      setIsVirtualMicActive(false);
      setSttStatusMessage('🎤 마이크 연결됨 (초고감도 음성 센싱 가동 중)');

      // Setup Web Audio Analyser for visualizer, VAD & Pitch / Gender estimation
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume().catch((e) => console.log('AudioContext resume note:', e));
        }
        audioContextRef.current = ctx;
        const src = ctx.createMediaStreamSource(stream);

        // Hardware Gain Boost for ultra-sensitive pickup
        const gainNode = ctx.createGain();
        const multiplier = micSensitivity === 'ultra' ? 3.5 : micSensitivity === 'high' ? 2.0 : 1.0;
        gainNode.gain.setValueAtTime(multiplier, ctx.currentTime);
        gainNodeRef.current = gainNode;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.3; // Highly responsive smoothing
        src.connect(gainNode);
        gainNode.connect(analyser);
        analyserRef.current = analyser;

        const freqData = new Uint8Array(analyser.frequencyBinCount);
        const timeData = new Uint8Array(analyser.fftSize);

        const updateAudioMetrics = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(freqData);
          analyserRef.current.getByteTimeDomainData(timeData);

          // Calculate precise RMS volume from Time Domain waveform
          let sumSquares = 0;
          for (let i = 0; i < timeData.length; i++) {
            const normalized = (timeData[i] - 128) / 128; // -1.0 ~ 1.0
            sumSquares += normalized * normalized;
          }
          const rms = Math.sqrt(sumSquares / timeData.length);
          const computedVolume = Math.min(100, Math.round(rms * 320));

          // 8-Band Frequency Visualizer
          const bands: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
          const bandSize = Math.max(1, Math.floor(freqData.length / 8));
          for (let i = 0; i < freqData.length; i++) {
            const bandIdx = Math.min(7, Math.floor(i / bandSize));
            bands[bandIdx] = Math.max(bands[bandIdx], freqData[i]);
          }

          setMicVolume(computedVolume);
          setAudioFrequencies(bands.map((b) => Math.min(100, Math.round((b / 255) * 100))));

          // Voice Fundamental Frequency (F0) & Gender Estimation
          const SPEECH_THRESHOLD = micSensitivity === 'ultra' ? 2 : micSensitivity === 'high' ? 4 : 8;
          if (computedVolume >= SPEECH_THRESHOLD && ctx.sampleRate) {
            let maxEnergy = 0;
            let peakBin = 0;
            const nyquist = ctx.sampleRate / 2;
            const binHz = nyquist / freqData.length;
            // Vocal range (80Hz to 320Hz)
            const minBin = Math.max(1, Math.floor(80 / binHz));
            const maxBin = Math.min(freqData.length - 1, Math.ceil(320 / binHz));

            for (let i = minBin; i <= maxBin; i++) {
              if (freqData[i] > maxEnergy) {
                maxEnergy = freqData[i];
                peakBin = i;
              }
            }

            if (maxEnergy > 25) {
              const estimatedHz = Math.round(peakBin * binHz);
              if (estimatedHz >= 80 && estimatedHz <= 320) {
                setEstimatedPitchHz(estimatedHz);
                // Pitch threshold: <165Hz Male voice, >=165Hz Female voice
                const detected = estimatedHz < 165 ? 'male' : 'female';
                setDetectedVoiceGender(detected);
              }
            }
          }

          // Voice Activity Detection (VAD) Logic
          if (computedVolume >= SPEECH_THRESHOLD && !isMuted && isAutoSttEnabled) {
            if (!isCurrentlySpeakingRef.current) {
              isCurrentlySpeakingRef.current = true;
              setIsSpeakingActive(true);
              speechStartTimestampRef.current = Date.now();
              setSttStatusMessage('🗣️ [초정밀 음성 센싱 중] 말씀하시는 음성을 실시간 수신하고 있습니다...');

              if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = null;
              }
            } else {
              if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = null;
              }
            }
          } else if (isCurrentlySpeakingRef.current) {
            if (!silenceTimerRef.current) {
              silenceTimerRef.current = setTimeout(() => {
                isCurrentlySpeakingRef.current = false;
                setIsSpeakingActive(false);
                setSttStatusMessage('🎙️ [음성 대기 중] 마이크가 초고감도로 가동 중입니다.');
                silenceTimerRef.current = null;
              }, 500);
            }
          }

          animFrameRef.current = requestAnimationFrame(updateAudioMetrics);
        };

        animFrameRef.current = requestAnimationFrame(updateAudioMetrics);
      }

      // Start Web Speech API for real-time speech-to-text
      startWebSpeechRecognition();

      return stream;
    } catch (err: any) {
      console.warn('Microphone stream access note:', err?.message || err);
      setMicPermissionState('denied');
      if (isUserInitiated) {
        setSttErrorNotice(
          '마이크 권한이 차단되어 있습니다. 브라우저 주소창 왼쪽 자물쇠 🔒 아이콘에서 마이크를 "허용"으로 변경해주세요.'
        );
      } else {
        setSttErrorNotice(
          '브라우저 마이크 권한 확인이 필요합니다. [마이크 허용 및 켜기] 버튼을 누르거나, [가상 마이크 모드]로 즉시 테스트할 수 있습니다.'
        );
      }
      setSttStatusMessage('마이크 권한 대기 중 (가상 음성 모드 지원)');
      return null;
    }
  };

  // Dynamic sensitivity gain effect
  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      const multiplier = micSensitivity === 'ultra' ? 3.5 : micSensitivity === 'high' ? 2.0 : 1.0;
      gainNodeRef.current.gain.setValueAtTime(multiplier, audioContextRef.current.currentTime);
    }
  }, [micSensitivity]);

  // Start parallel Web Speech API for zero-latency interim feedback
  const startWebSpeechRecognition = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition || isMuted || !isAutoSttEnabled) return;

    if (isRecognitionRunningRef.current && webSpeechRecognitionRef.current) {
      return;
    }

    try {
      if (webSpeechRecognitionRef.current) {
        try {
          webSpeechRecognitionRef.current.abort();
        } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      webSpeechRecognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = translationDirection.startsWith('ko')
        ? 'ko-KR'
        : translationDirection.includes('de')
        ? 'de-DE'
        : 'en-US';

      recognition.onstart = () => {
        isRecognitionRunningRef.current = true;
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const recognized = (final || interim).trim();
        if (recognized) {
          setLiveInterimSpeech(recognized);
          pendingInterimRef.current = recognized;

          if (final && final.trim()) {
            if (interimCommitTimerRef.current) clearTimeout(interimCommitTimerRef.current);
            pendingInterimRef.current = '';
            handleTranslateAndSpeak(final.trim());
          } else {
            // Auto-commit interim buffer after 750ms of silence so no phrase is dropped
            if (interimCommitTimerRef.current) clearTimeout(interimCommitTimerRef.current);
            interimCommitTimerRef.current = setTimeout(() => {
              if (pendingInterimRef.current && pendingInterimRef.current.trim()) {
                const committed = pendingInterimRef.current.trim();
                pendingInterimRef.current = '';
                handleTranslateAndSpeak(committed);
              }
            }, 750);
          }
        }
      };

      recognition.onerror = (e: any) => {
        isRecognitionRunningRef.current = false;
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          console.warn('Web Speech notice:', e.error);
        }
        if (e.error !== 'not-allowed' && !isMuted && isAutoSttEnabled) {
          if (restartRecognitionTimerRef.current) clearTimeout(restartRecognitionTimerRef.current);
          restartRecognitionTimerRef.current = setTimeout(() => {
            startWebSpeechRecognition();
          }, 250);
        }
      };

      recognition.onend = () => {
        isRecognitionRunningRef.current = false;
        // Commit any pending interim phrase before restart
        if (pendingInterimRef.current && pendingInterimRef.current.trim()) {
          const committed = pendingInterimRef.current.trim();
          pendingInterimRef.current = '';
          handleTranslateAndSpeak(committed);
        }
        if (!isMuted && isAutoSttEnabled) {
          if (restartRecognitionTimerRef.current) clearTimeout(restartRecognitionTimerRef.current);
          restartRecognitionTimerRef.current = setTimeout(() => {
            startWebSpeechRecognition();
          }, 100);
        }
      };

      recognition.start();
    } catch (e) {
      isRecognitionRunningRef.current = false;
      console.warn('Web Speech init notice:', e);
    }
  }, [isMuted, isAutoSttEnabled, translationDirection, handleTranslateAndSpeak]);

  // Speech Recognition continuous watchdog
  useEffect(() => {
    if (isMuted || !isAutoSttEnabled) {
      if (webSpeechRecognitionRef.current) {
        try {
          webSpeechRecognitionRef.current.stop();
        } catch (e) {}
        isRecognitionRunningRef.current = false;
      }
      return;
    }

    startWebSpeechRecognition();

    const watchdog = setInterval(() => {
      if (!isMuted && isAutoSttEnabled && !isRecognitionRunningRef.current) {
        startWebSpeechRecognition();
      }
    }, 2000);

    return () => {
      clearInterval(watchdog);
      if (restartRecognitionTimerRef.current) clearTimeout(restartRecognitionTimerRef.current);
    };
  }, [isMuted, isAutoSttEnabled, startWebSpeechRecognition]);

  // Handle Manual Push-to-Talk / Click-to-Record (100% Reliable Trigger)
  const handleStartManualRecording = async () => {
    try {
      setSttErrorNotice(null);
      let stream = audioStreamRef.current;
      if (!stream || !stream.active) {
        stream = await initializeAudioStream();
        if (!stream) return;
      }

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/wav';

      const recorder = new MediaRecorder(stream, { mimeType });
      manualRecorderRef.current = recorder;
      manualChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) manualChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        setIsRecordingManualAudio(false);
        setManualRecordSeconds(0);
        if (manualTimerIntervalRef.current) {
          clearInterval(manualTimerIntervalRef.current);
          manualTimerIntervalRef.current = null;
        }

        const audioBlob = new Blob(manualChunksRef.current, { type: mimeType });
        await processAudioChunkWithGemini(audioBlob, true);
      };

      recorder.start();
      setIsRecordingManualAudio(true);
      setManualRecordSeconds(1);
      setSttStatusMessage('🎙️ 지금 마이크에 대고 말씀하세요! (녹음 중)');

      manualTimerIntervalRef.current = setInterval(() => {
        setManualRecordSeconds((prev) => {
          if (prev >= 6) {
            if (manualRecorderRef.current && manualRecorderRef.current.state === 'recording') {
              manualRecorderRef.current.stop();
            }
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Manual recording error:', err);
      setIsRecordingManualAudio(false);
      setSttErrorNotice('마이크 녹음 시작에 실패했습니다: ' + (err.message || '알 수 없는 오류'));
    }
  };

  const handleStopManualRecording = () => {
    if (manualRecorderRef.current && manualRecorderRef.current.state === 'recording') {
      manualRecorderRef.current.stop();
    }
  };

  // Simulate speaking activity with sound wave animation (for virtual mic mode or quick test)
  const triggerVirtualAudioSpeaking = (text: string, forcedSpeaker?: UserProfile) => {
    const speaker = forcedSpeaker || currentUser;
    setIsSpeakingActive(true);
    setLiveInterimSpeech(text);
    setSttStatusMessage(`🗣️ ${speaker.name} 발화 중: "${text}"`);

    // Animate frequencies
    const interval = setInterval(() => {
      setAudioFrequencies(Array.from({ length: 8 }, () => Math.floor(Math.random() * 85) + 15));
      setMicVolume(Math.floor(Math.random() * 60) + 35);
    }, 80);

    setTimeout(() => {
      clearInterval(interval);
      setAudioFrequencies([0, 0, 0, 0, 0, 0, 0, 0]);
      setMicVolume(0);
      setIsSpeakingActive(false);
      handleTranslateAndSpeak(text, speaker);
    }, 1200);
  };

  // Main lifecycle for Audio Stream & Mute toggle
  useEffect(() => {
    if (isMuted) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioStreamRef.current) {
        audioStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = false));
      }
      if (webSpeechRecognitionRef.current) {
        try {
          webSpeechRecognitionRef.current.stop();
        } catch (e) {}
      }
      setMicVolume(0);
      setAudioFrequencies([0, 0, 0, 0, 0, 0, 0, 0]);
      setIsSpeakingActive(false);
      setSttStatusMessage('회의 마이크가 꺼져 있습니다.');
      return;
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = true));
    } else if (micPermissionState !== 'denied') {
      initializeAudioStream(false);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isMuted, translationDirection]);

  // Webcam stream management (Robust Start/Stop/Restart Lifecycle)
  const stopWebcam = useCallback(() => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      videoStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    setHasWebcamStream(false);
  }, []);

  const startWebcam = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasWebcamStream(false);
        return null;
      }

      // Stop previous stream if any
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((t) => {
          try {
            t.stop();
          } catch (e) {}
        });
        videoStreamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user',
        },
      });

      videoStreamRef.current = stream;
      setHasWebcamStream(true);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        try {
          await localVideoRef.current.play();
        } catch (playErr) {
          console.log('Local video play notice:', playErr);
        }
      }

      return stream;
    } catch (e) {
      console.warn('Webcam stream not accessible or permission denied:', e);
      setHasWebcamStream(false);
      return null;
    }
  }, []);

  // Webcam stream toggle effect
  useEffect(() => {
    if (isVideoOff) {
      stopWebcam();
    } else {
      startWebcam();
    }
  }, [isVideoOff, startWebcam, stopWebcam]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (e) {}
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (maxSpeechTimerRef.current) clearTimeout(maxSpeechTimerRef.current);
      if (manualTimerIntervalRef.current) clearInterval(manualTimerIntervalRef.current);
    };
  }, [stopWebcam]);

  // Generate AI Executive Meeting Summary via Gemini
  const handleGenerateSummary = async () => {
    setIsSummarizing(true);
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: messages.map((m) => ({
            speaker: m.speakerName,
            company: m.company === 'eurotech_korea' ? '유로테크' : 'Wallpen Germany',
            text: m.originalText,
            translatedText: m.translatedText,
            timestamp: m.timestamp,
          })),
          meetingTitle: '유로테크(Korea) - Wallpen Germany HQ 화상회의',
          participants: [currentUser.name, remoteUser.name],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAiSummaryReport(data.report);
        setShowSummaryModal(true);
        if (onSaveMeetingRecord) {
          onSaveMeetingRecord(messages, data.report);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSummarizing(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-950 text-white overflow-hidden">
      {/* Top Bar: Conference Title & Quick Status */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-full font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>실시간 AI 동시통역 가동 중</span>
          </div>
          <h2 className="text-sm font-bold text-slate-100 hidden md:block">
            {isEurotechUser
              ? '유로테크(Wallpen Korea) ↔ 독일 Wallpen 본사 기술 & 영업 실시간 채널'
              : 'Wallpen Germany HQ ↔ Eurotech Korea Distributor Channel'}
          </h2>
        </div>

        {/* Translation Language & Gender Voice Selector Controls */}
        <div className="flex items-center space-x-2 text-xs flex-wrap gap-y-1.5">
          {/* Direction */}
          <div className="flex items-center space-x-1.5 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg">
            <Languages className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300 font-medium">통역 방향:</span>
            <select
              value={translationDirection}
              onChange={(e: any) => setTranslationDirection(e.target.value)}
              className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ko_to_en" className="bg-slate-900 text-white">
                🇰🇷 한국어 ➔ 🇺🇸 영어 (US English) [기본]
              </option>
              <option value="en_to_ko" className="bg-slate-900 text-white">
                🇺🇸 영어 ➔ 🇰🇷 한국어 (KO)
              </option>
              <option value="ko_to_de" className="bg-slate-900 text-white">
                🇰🇷 한국어 ➔ 🇩🇪 독일어 (DE)
              </option>
              <option value="de_to_ko" className="bg-slate-900 text-white">
                🇩🇪 독일어 ➔ 🇰🇷 한국어 (KO)
              </option>
            </select>
          </div>

          {/* Mic Sensitivity Boost Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg">
            <span className="text-slate-300 font-medium">⚡ 마이크 감도:</span>
            <select
              value={micSensitivity}
              onChange={(e: any) => setMicSensitivity(e.target.value)}
              className="bg-transparent text-emerald-300 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ultra" className="bg-slate-900 text-white">
                ⚡ 초고감도 (3.5x 부스트 / 작은 목소리)
              </option>
              <option value="high" className="bg-slate-900 text-white">
                🔊 고감도 (2.0x 부스트)
              </option>
              <option value="standard" className="bg-slate-900 text-white">
                🎙️ 표준 감도 (1.0x)
              </option>
            </select>
          </div>

          {/* Gender Voice Selection */}
          <div className="flex items-center space-x-1.5 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg">
            <span className="text-slate-300 font-medium">🗣️ 성별 보이스:</span>
            <select
              value={selectedVoiceGender}
              onChange={(e: any) => setSelectedVoiceGender(e.target.value)}
              className="bg-transparent text-emerald-300 font-bold focus:outline-none cursor-pointer"
            >
              <option value="auto" className="bg-slate-900 text-white">
                🤖 AI 자동인식 ({detectedVoiceGender === 'male' ? '👨 남성' : '👩 여성'} / {estimatedPitchHz}Hz)
              </option>
              <option value="male" className="bg-slate-900 text-white">
                👨 남성 보이스 (US Male)
              </option>
              <option value="female" className="bg-slate-900 text-white">
                👩 여성 보이스 (US Female)
              </option>
            </select>
          </div>

          {/* TTS On/Off */}
          <button
            onClick={() => setIsTtsEnabled(!isTtsEnabled)}
            title="통역 음성 자동 읽기 On/Off"
            className={`p-1.5 rounded-lg border flex items-center gap-1 font-medium transition-colors ${
              isTtsEnabled
                ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {isTtsEnabled ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden lg:inline">{isTtsEnabled ? '음성 출력 켜짐' : '음성 끄기'}</span>
          </button>

          <button
            onClick={() => setShowMicHelpModal(true)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 font-medium"
            title="마이크 음성인식 진단 및 가이드"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">음성 진단</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Video Streams + Subtitles + Transcript Drawer */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Video Stream Grid & Floating Subtitle Bar */}
        <div className="flex-1 flex flex-col p-4 space-y-3 overflow-y-auto">
          {/* Microphone Permission Warning / Setup Banner if needed */}
          {sttErrorNotice && (
            <div className="bg-slate-900/95 border-2 border-amber-500/70 rounded-2xl p-3.5 shadow-xl backdrop-blur-md flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <Mic className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-amber-200">{sttErrorNotice}</p>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    브라우저 마이크 허용이 필요하거나, 아래 <strong>[원클릭 음성 발화 테스트]</strong>로 즉시 실시간 통역을 체험하실 수 있습니다.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => initializeAudioStream(true)}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl border border-amber-400 transition-colors shrink-0 flex items-center gap-1.5 shadow"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>마이크 권한 허용 및 연결</span>
                </button>
                <button
                  onClick={() => {
                    setIsVirtualMicActive(true);
                    setSttErrorNotice(null);
                    setSttStatusMessage('💡 가상 마이크 모드 활성화됨 (원클릭 테스트 또는 텍스트 입력으로 통역 가능)');
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-3 py-1.5 rounded-xl border border-slate-700 transition-colors shrink-0"
                >
                  가상 모드로 닫기
                </button>
              </div>
            </div>
          )}

          {/* Dual Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-[280px]">
            {/* Local Stream (Current User) */}
            <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between group min-h-[250px]">
              {/* Background Video Stream / Visualizer / WebCam */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/60 overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={() => {
                    if (localVideoRef.current) {
                      localVideoRef.current.play().catch((e) => console.log('Video metadata play notice:', e));
                    }
                  }}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                    !isVideoOff && hasWebcamStream ? 'opacity-100 z-0' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                />

                {isVideoOff ? (
                  <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <div
                      className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center border-2 shadow-2xl ${
                        currentUser.company === 'eurotech_korea'
                          ? 'bg-blue-950/90 border-blue-500/60 text-blue-400 ring-4 ring-blue-500/20'
                          : 'bg-amber-950/90 border-amber-500/60 text-amber-400 ring-4 ring-amber-500/20'
                      }`}
                    >
                      <User className="w-10 h-10 sm:w-12 sm:h-12" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-base">{currentUser.company === 'eurotech_korea' ? '🇰🇷' : '🇩🇪'}</span>
                        <p className="text-sm font-bold text-white tracking-tight">{currentUser.name}</p>
                      </div>
                      <div className="inline-flex items-center gap-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                        <VideoOff className="w-3.5 h-3.5 text-rose-400" />
                        <span>카메라 꺼짐</span>
                      </div>
                    </div>
                  </div>
                ) : !hasWebcamStream ? (
                  <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6 text-center">
                    <div className="relative mb-3">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-2xl ring-4 ring-blue-400/30">
                        <User className="w-10 h-10 sm:w-12 sm:h-12" />
                      </div>
                      <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm">{currentUser.company === 'eurotech_korea' ? '🇰🇷' : '🇩🇪'}</span>
                      <span className="text-sm font-bold text-white">{currentUser.name}</span>
                    </div>
                    <p className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      실시간 오디오 및 비디오 채널 활성화됨
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Stream Header Badge */}
              <div className="relative z-10 p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs">
                  <span className={`w-2 h-2 rounded-full ${isVideoOff ? 'bg-rose-500' : 'bg-emerald-400 animate-pulse'}`}></span>
                  <span className="font-semibold text-white">
                    {currentUser.name} ({isEurotechUser ? '🇰🇷 유로테크 총판' : '🇩🇪 Wallpen HQ'})
                  </span>
                </div>

                {isSpeakingActive && (
                  <span className="bg-emerald-500 text-slate-950 text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse shadow-lg ring-2 ring-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
                    음성 발화 중 ({estimatedPitchHz}Hz • {detectedVoiceGender === 'male' ? '남성' : '여성'})
                  </span>
                )}
              </div>

              {/* Stream Footer Control Overlay */}
              <div className="relative z-10 p-3 flex items-center justify-between bg-gradient-to-t from-slate-950/90 to-transparent">
                <div className="text-[11px] text-slate-300 font-medium">
                  {currentUser.department}
                </div>
                <div className="flex items-center space-x-1.5">
                  {isMuted && <MicOff className="w-4 h-4 text-rose-400" />}
                  {isVideoOff && <VideoOff className="w-4 h-4 text-amber-400" />}
                </div>
              </div>
            </div>

            {/* Remote Stream (Counterpart) */}
            <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between group min-h-[250px]">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/60">
                {isRemoteVideoOff ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <div
                      className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center border-2 shadow-2xl ${
                        remoteUser.company === 'eurotech_korea'
                          ? 'bg-blue-950/90 border-blue-500/60 text-blue-400 ring-4 ring-blue-500/20'
                          : 'bg-indigo-950/90 border-indigo-500/60 text-indigo-400 ring-4 ring-indigo-500/20'
                      }`}
                    >
                      <User className="w-10 h-10 sm:w-12 sm:h-12" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-base">{remoteUser.company === 'eurotech_korea' ? '🇰🇷' : '🇩🇪'}</span>
                        <p className="text-sm font-bold text-white tracking-tight">{remoteUser.name}</p>
                      </div>
                      <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                        <VideoOff className="w-3.5 h-3.5 text-amber-400" />
                        <span>상대방 카메라 꺼짐</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center">
                    <div className="relative mb-3">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-2xl ring-4 ring-indigo-400/30">
                        <User className="w-10 h-10 sm:w-12 sm:h-12" />
                      </div>
                      <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm">{remoteUser.company === 'eurotech_korea' ? '🇰🇷' : '🇩🇪'}</span>
                      <span className="text-sm font-bold text-white">{remoteUser.name}</span>
                    </div>
                    <p className="text-[10px] text-blue-300 font-semibold bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                      본사 라이브 수신 중 (HD 1080p)
                    </p>
                  </div>
                )}
              </div>

              <div className="relative z-10 p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs">
                  <span className={`w-2 h-2 rounded-full ${isRemoteVideoOff ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`}></span>
                  <span className="font-semibold text-white">
                    {remoteUser.name} ({isEurotechUser ? '🇩🇪 Wallpen HQ' : '🇰🇷 유로테크 총판'})
                  </span>
                </div>
                <button
                  onClick={() => setIsRemoteVideoOff(!isRemoteVideoOff)}
                  className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                >
                  {isRemoteVideoOff ? <VideoIcon className="w-3 h-3 text-emerald-400" /> : <VideoOff className="w-3 h-3 text-amber-400" />}
                  <span>{isRemoteVideoOff ? '화면 켜기' : '화면 끄기'}</span>
                </button>
              </div>

              <div className="relative z-10 p-3 flex items-center justify-between bg-gradient-to-t from-slate-950/90 to-transparent">
                <div className="text-[11px] text-slate-300 font-medium">
                  {remoteUser.department} ({remoteUser.location})
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Voice Recognition & Audio Monitor Ribbon */}
          <div className="bg-gradient-to-r from-emerald-950/95 via-slate-900/95 to-blue-950/95 border-2 border-emerald-400/90 ring-4 ring-emerald-400/30 shadow-[0_0_30px_rgba(52,211,153,0.3)] backdrop-blur-xl rounded-2xl p-3.5 transition-all flex flex-col gap-2.5">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 border-b border-slate-800/80 pb-2.5">
              {/* Left: Live Visualizer & Dynamic Mic Status */}
              <div className="flex items-center space-x-3.5 flex-1">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0 flex items-center gap-2">
                  <Mic className={`w-5 h-5 ${isSpeakingActive ? 'text-emerald-400 animate-bounce' : 'text-emerald-400 animate-pulse'}`} />
                  
                  {/* Real-time 8-Band Equalizer Visualizer */}
                  <div className="flex items-end gap-1 h-6 w-16 px-1 bg-slate-950/80 rounded-lg border border-emerald-500/30">
                    {audioFrequencies.map((val, idx) => (
                      <span
                        key={idx}
                        className="w-1.5 rounded-full transition-all duration-75"
                        style={{
                          height: `${Math.max(15, val)}%`,
                          backgroundColor: val > 50 ? '#34d399' : val > 20 ? '#6ee7b7' : '#059669',
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Dynamic Speech Activity Badge */}
                    {isSpeakingActive ? (
                      <span className="bg-emerald-500 text-slate-950 text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow ring-2 ring-emerald-300 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
                        🟢 [음성 감지] {detectedVoiceGender === 'male' ? '👨 남성' : '👩 여성'} Voice ({estimatedPitchHz}Hz)
                      </span>
                    ) : (
                      <span className="bg-slate-800 text-slate-400 border border-slate-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-500" />
                        ⚪ [대기 중] 마이크 준비됨
                      </span>
                    )}

                    {/* Real-time Dynamic Volume Gauge */}
                    <div className="flex items-center gap-1.5 bg-slate-950/90 border border-slate-700/80 px-2.5 py-0.5 rounded-full">
                      <span className="text-[11px] font-semibold text-slate-300">실시간 볼륨:</span>
                      <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700 flex">
                        <div
                          className={`h-full transition-all duration-75 rounded-full ${
                            micVolume > 40
                              ? 'bg-emerald-400'
                              : micVolume > 15
                              ? 'bg-teal-400'
                              : micVolume > 0
                              ? 'bg-blue-400'
                              : 'bg-slate-600'
                          }`}
                          style={{ width: `${Math.min(100, micVolume)}%` }}
                        />
                      </div>
                      <span className={`text-[11px] font-mono font-bold ${micVolume > 15 ? 'text-emerald-300' : 'text-slate-400'}`}>
                        {micVolume}%
                      </span>
                    </div>

                    {isAutoSttEnabled ? (
                      <span className="bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        ⚡ 실시간 자동 감지 ON
                      </span>
                    ) : (
                      <span className="bg-amber-600/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        수동 버튼 모드
                      </span>
                    )}
                  </div>

                  {/* Real-time Spoken Text Display */}
                  <p className="text-sm font-bold text-white leading-snug">
                    {liveInterimSpeech ? (
                      <span className="text-amber-300 bg-slate-950/95 px-3 py-1.5 rounded-xl border-2 border-amber-400/80 inline-block shadow-md animate-pulse">
                        "{liveInterimSpeech}"
                      </span>
                    ) : (
                      <span className="text-slate-300 font-medium text-xs">
                        {isMuted
                          ? '회의 마이크가 꺼져 있습니다. 아래 회의 마이크 버튼을 켜주세요.'
                          : '마이크가 켜져 있습니다. 말씀하시면 AI가 실시간으로 음성을 인식하고 영어 동시통역 자막 및 TTS 음성을 출력합니다.'}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Right: Manual Direct Record & Speak Controls */}
              <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                {!isRecordingManualAudio ? (
                  <button
                    onClick={handleStartManualRecording}
                    className="bg-gradient-to-r from-rose-600 via-amber-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-lg border border-amber-300 transition-all flex items-center gap-2"
                  >
                    <Mic className="w-4 h-4 animate-bounce" />
                    <span>🎙️ 지금 말하기 (클릭 후 발화)</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStopManualRecording}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-lg border-2 border-white transition-all flex items-center gap-2 animate-pulse"
                  >
                    <Square className="w-4 h-4 text-white" />
                    <span>🔴 녹음 완료 및 즉시 통역 ({manualRecordSeconds}초)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Engine Status Line */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-slate-950/90 p-2 rounded-xl border border-slate-800 text-xs">
              <div className="text-[11px] font-medium text-emerald-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span>{sttStatusMessage}</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Sensitivity Quick Toggle Pills */}
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5 text-[10px]">
                  <span className="text-slate-400 px-1.5 font-medium">감도:</span>
                  <button
                    onClick={() => setMicSensitivity('ultra')}
                    className={`px-2 py-0.5 rounded font-bold transition-colors ${
                      micSensitivity === 'ultra'
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ⚡ 초고감도 (3.5x)
                  </button>
                  <button
                    onClick={() => setMicSensitivity('high')}
                    className={`px-2 py-0.5 rounded font-bold transition-colors ${
                      micSensitivity === 'high'
                        ? 'bg-teal-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🔊 고감도 (2.0x)
                  </button>
                  <button
                    onClick={() => setMicSensitivity('standard')}
                    className={`px-2 py-0.5 rounded font-bold transition-colors ${
                      micSensitivity === 'standard'
                        ? 'bg-slate-700 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🎙️ 표준 (1.0x)
                  </button>
                </div>

                <button
                  onClick={() => setIsAutoSttEnabled(!isAutoSttEnabled)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                    isAutoSttEnabled
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isAutoSttEnabled ? '자동 음성인식 모드' : '수동 음성인식 모드'}
                </button>

                <button
                  onClick={initializeAudioStream}
                  className="text-[10px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>마이크 재연결</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Voice Translation Preset Buttons (원클릭 음성 발화 & 영어 통역 테스트 바) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold shrink-0">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>원클릭 발화 테스트:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => triggerVirtualAudioSpeaking('안녕하세요 테스트를 시작합니다')}
                className="bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Play className="w-3 h-3 text-emerald-400" />
                <span>"안녕하세요 테스트를 시작합니다" ➔ 🇺🇸 영어 통역</span>
              </button>
              <button
                onClick={() => triggerVirtualAudioSpeaking('노즐 테스트를 진행하겠습니다')}
                className="bg-slate-800 hover:bg-teal-600 text-slate-200 hover:text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-slate-700 hover:border-teal-500 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Play className="w-3 h-3 text-teal-400" />
                <span>"노즐 테스트 진행" ➔ 🇺🇸 영어 통역</span>
              </button>
              <button
                onClick={() => triggerVirtualAudioSpeaking('레이저 거리 센서 보정을 확인해 주세요')}
                className="bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-slate-700 hover:border-indigo-500 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Play className="w-3 h-3 text-indigo-400" />
                <span>"레이저 센서 보정 확인" ➔ 🇺🇸 영어 통역</span>
              </button>
            </div>
          </div>

          {/* AI Translation Processing Notification Banner */}
          {isTranslating && (
            <div className="bg-gradient-to-r from-blue-950/95 via-slate-900/95 to-indigo-950/95 border-2 border-blue-400/80 backdrop-blur-xl rounded-2xl p-3 shadow-2xl transition-all flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/40 shrink-0">
                <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                    GEMINI AI 실시간 통역 중
                  </span>
                  <span className="text-xs font-bold text-blue-200">
                    Wallpen 기술 용어 검증 및 미국 영어(US English) 음성 통역을 생성하고 있습니다...
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Floating Live AI Subtitle Banner (동시통역 최신 자막 레이어) */}
          {currentSubtitle && (() => {
            const info = getSpeakerInfo(currentSubtitle.company, currentSubtitle.speakerName);
            const origFlag = currentSubtitle.originalLang === 'ko' ? '🇰🇷' : currentSubtitle.originalLang === 'de' ? '🇩🇪' : '🇺🇸';
            const transFlag = currentSubtitle.translatedLang === 'en' ? '🇺🇸' : currentSubtitle.translatedLang === 'de' ? '🇩🇪' : '🇰🇷';

            return (
              <div className={`bg-slate-900/90 border border-slate-700 backdrop-blur-lg rounded-2xl p-4 shadow-2xl transition-all ${info.borderLeftStyle}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" /> [최신 라이브 자막] 실시간 AI 동시통역
                    </span>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="text-base leading-none">{info.flag}</span>
                      <span className={info.nameColor}>{currentSubtitle.speakerName}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${info.badgeStyle}`}>
                        {info.companyLabel}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => speakText(currentSubtitle.translatedText, currentSubtitle.translatedLang)}
                      className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                      title="통역 음성 다시 듣기"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>음성 재생</span>
                    </button>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {currentSubtitle.timestamp}
                    </span>
                  </div>
                </div>

                {/* Original & Translated Speech Pairs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <span>{origFlag} 원문 ({currentSubtitle.originalLang.toUpperCase()})</span>
                    </div>
                    <p className="text-sm font-medium text-slate-100 leading-relaxed">
                      "{currentSubtitle.originalText}"
                    </p>
                  </div>

                  <div className="bg-amber-950/40 p-3 rounded-xl border-2 border-amber-500/50 shadow-inner">
                    <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span>{transFlag} AI 실시간 통역 ({currentSubtitle.translatedLang.toUpperCase()})</span>
                      </span>
                    </div>
                    <p className="text-sm font-bold text-amber-200 leading-relaxed">
                      "{currentSubtitle.translatedText}"
                    </p>
                  </div>
                </div>

                {currentSubtitle.technicalTerm && (
                  <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-blue-400" />
                    <span>Wallpen 기술 용어 검증: {currentSubtitle.technicalTerm}</span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Right Side: Live Transcript Drawer (Collapsible) */}
        {showTranscriptDrawer && (
          <div className="w-full md:w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full shrink-0">
            {/* Drawer Header */}
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-xs text-white">실시간 통역 회의록</span>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold">
                  최신순 • {messages.length}건
                </span>
              </div>
              <button
                onClick={() => setShowTranscriptDrawer(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Transcript Messages List (Newest at Top) */}
            <div ref={transcriptContainerRef} className="flex-1 p-3 overflow-y-auto space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-200">기록된 회의 대화가 없습니다</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed max-w-[210px]">
                      마이크로 말씀하시거나 아래 텍스트를 입력하면 실시간 통역 자막과 회의록이 이곳에 기록됩니다.
                    </p>
                  </div>
                </div>
              ) : (
                [...messages].slice().reverse().map((m, idx) => {
                  const isLatest = idx === 0;
                  const info = getSpeakerInfo(m.company, m.speakerName);
                  const isKorean = m.originalLang === 'ko';
                  const origFlag = isKorean ? '🇰🇷' : m.originalLang === 'de' ? '🇩🇪' : '🇺🇸';
                  const transFlag = m.translatedLang === 'en' ? '🇺🇸' : m.translatedLang === 'de' ? '🇩🇪' : '🇰🇷';

                  return (
                    <div
                      key={m.id}
                      className={`p-3 rounded-xl text-xs space-y-2 border transition-all ${
                        isLatest
                          ? `${info.boxStyle} ring-2 ring-amber-400/50 shadow-xl`
                          : info.boxStyle
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm leading-none">{info.flag}</span>
                          <span className={`font-bold ${info.nameColor}`}>{m.speakerName}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${info.badgeStyle}`}>
                            {info.companyLabel}
                          </span>
                          {isLatest && (
                            <span className="bg-amber-400/20 text-amber-300 text-[9px] font-bold px-1.5 py-0.2 rounded border border-amber-400/40">
                              NEW
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1.5 shrink-0">
                          <span>{m.timestamp}</span>
                          <button
                            onClick={() => copyToClipboard(m.translatedText, m.id)}
                            className="text-slate-400 hover:text-amber-400 p-0.5"
                            title="번역문 복사"
                          >
                            {copiedId === m.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Original Speech Box */}
                      <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 space-y-0.5">
                        <div className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                          <span>{origFlag} 원문 ({m.originalLang.toUpperCase()})</span>
                        </div>
                        <p className="text-slate-200 font-medium leading-relaxed">{m.originalText}</p>
                      </div>

                      {/* Translated Speech Box */}
                      <div className="bg-amber-950/30 p-2 rounded-lg border border-amber-500/30 space-y-0.5">
                        <div className="text-[9px] font-bold text-amber-400 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <span>{transFlag} 실시간 통역 ({m.translatedLang.toUpperCase()})</span>
                          </span>
                          <button
                            onClick={() => speakText(m.translatedText, m.translatedLang)}
                            className="text-amber-300 hover:text-white flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 transition-colors"
                            title="통역 음성 다시 듣기"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>다시듣기</span>
                          </button>
                        </div>
                        <p className="text-amber-200 font-bold leading-relaxed">{m.translatedText}</p>
                      </div>

                      {m.technicalTerm && (
                        <div className="text-[9px] text-slate-400 flex items-center gap-1 pt-0.5">
                          <Wrench className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                          <span className="truncate">{m.technicalTerm}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* AI Summarize Button inside Drawer */}
            <div className="p-3 border-t border-slate-800 bg-slate-900 space-y-2">
              <button
                onClick={handleGenerateSummary}
                disabled={isSummarizing || messages.length === 0}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>{isSummarizing ? 'AI 요약서 작성 중...' : 'Gemini 회의록 AI 요약 생성'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Speech Input & Meeting Control Bar */}
      <div className="bg-slate-900 border-t border-slate-800 p-3 flex flex-col xl:flex-row items-center justify-between gap-3">
        {/* Left: Media Control Buttons (Conference Call Audio/Video) */}
        <div className="flex items-center space-x-2 shrink-0 flex-wrap gap-y-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2.5 rounded-xl border font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md ${
              !isMuted
                ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-400/50 shadow-emerald-500/20'
                : 'bg-rose-600 text-white border-rose-500'
            }`}
            title="화상통화 메인 오디오 마이크 On/Off"
          >
            {!isMuted ? <Mic className="w-4 h-4 text-white animate-pulse" /> : <MicOff className="w-4 h-4 text-white" />}
            <span>{!isMuted ? '🎙️ 회의 마이크 켜짐' : '회의 마이크 끔'}</span>
          </button>

          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-2.5 rounded-xl border font-semibold text-xs flex items-center space-x-1.5 transition-colors ${
              isVideoOff
                ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="화상통화 카메라 On/Off"
          >
            {isVideoOff ? <VideoOff className="w-4 h-4 text-white" /> : <VideoIcon className="w-4 h-4 text-blue-400" />}
            <span>{isVideoOff ? '카메라 끔' : '카메라'}</span>
          </button>

          <button
            onClick={() => setShowWhiteboard(true)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>도면 화이트보드</span>
          </button>

          {!showTranscriptDrawer && (
            <button
              onClick={() => setShowTranscriptDrawer(true)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5"
            >
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span>회의록 열기</span>
            </button>
          )}
        </div>

        {/* Center: Secondary Manual Query / Text Input Box */}
        <div className="flex-1 max-w-2xl w-full flex items-center space-x-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          <div className="px-2.5 text-xs text-slate-400 font-bold flex items-center gap-1 shrink-0">
            <AudioLines className="w-4 h-4 text-amber-400" />
            <span>텍스트 입력:</span>
          </div>

          <input
            type="text"
            value={inputManualText}
            onChange={(e) => setInputManualText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTranslateAndSpeak(inputManualText)}
            placeholder={
              isEurotechUser
                ? '질의 또는 공유할 내용을 입력 후 전송 (예: 안녕하세요 테스트를 시작합니다)...'
                : 'Enter query or message to translate...'
            }
            className="flex-1 bg-transparent border-0 text-xs text-white placeholder-slate-500 focus:outline-none px-2"
          />

          <button
            onClick={() => handleTranslateAndSpeak(inputManualText)}
            disabled={isTranslating || !inputManualText.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 disabled:opacity-40 transition-all shrink-0 shadow"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">동시통역 전송</span>
          </button>
        </div>

        {/* Right: End Call */}
        <button
          onClick={onEndCall}
          className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-1.5 transition-colors shrink-0"
        >
          <PhoneOff className="w-4 h-4" />
          <span>회의 종료</span>
        </button>
      </div>

      {/* Whiteboard Modal */}
      <WhiteboardModal
        isOpen={showWhiteboard}
        onClose={() => setShowWhiteboard(false)}
        speakerName={currentUser.name}
      />

      {/* Mic Diagnostic / Help Modal */}
      {showMicHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Mic className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">마이크 음성인식 진단 및 가이드</h3>
              </div>
              <button onClick={() => setShowMicHelpModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Mic Status card */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">현재 마이크 상태:</span>
                  <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${micPermissionState === 'granted' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                    {micPermissionState === 'granted' ? '정상 연결됨' : '권한 확인 필요'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">실시간 입력 음량 (dB):</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full transition-all duration-75" style={{ width: `${micVolume}%` }} />
                    </div>
                    <span className="font-mono text-emerald-300 font-bold">{micVolume}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">감지된 음성 주파수 & 성별:</span>
                  <span className="font-bold text-amber-300">
                    {estimatedPitchHz}Hz ({detectedVoiceGender === 'male' ? '👨 남성' : '👩 여성'} Voice)
                  </span>
                </div>
              </div>

              {/* Troubleshooting Tips */}
              <div className="space-y-1.5 text-slate-300">
                <h4 className="font-bold text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> 음성/카메라 진단 및 가이드:
                </h4>
                <ul className="list-disc list-inside space-y-1 pl-1 text-slate-300">
                  <li>
                    <strong>새로고침 시 권한 팝업이 뜨지 않는 이유</strong>: Chrome/Safari 등 브라우저는 최초에 <strong>"허용"</strong>된 사이트의 권한을 브라우저에 저장(기억)하므로, 새로고침 시 팝업 없이 즉시 연결됩니다.
                  </li>
                  <li>
                    권한을 재설정하거나 차단 해제하려면 브라우저 상단 주소창 왼쪽의 <strong>자물쇠 🔒</strong> 또는 <strong>카메라/마이크 아이콘</strong>을 클릭하여 <strong>허용</strong>으로 변경해주세요.
                  </li>
                  <li>
                    주변 소음이 있거나 인식이 어려울 때는 상단의 <strong>[🎙️ 지금 말하기 (클릭 후 발화)]</strong> 버튼을 클릭하여 직접 녹음 후 통역할 수 있습니다.
                  </li>
                  <li>
                    화면 상단의 <strong>원클릭 발화 테스트</strong> 버튼으로 즉시 AI 통역 기능을 테스트할 수 있습니다.
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
              <button
                onClick={initializeAudioStream}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>마이크 재초기화</span>
              </button>
              <button
                onClick={() => setShowMicHelpModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Summary Report Modal */}
      {showSummaryModal && aiSummaryReport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Gemini AI 실시간 통역 회의 요약 보고서
                </h3>
              </div>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary Body */}
            <div className="space-y-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-amber-400 font-bold uppercase">
                  한국어 회의 요약
                </span>
                <p className="text-slate-200 leading-relaxed font-medium">
                  {aiSummaryReport.summaryKo}
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-blue-400 font-bold uppercase">
                  English Executive Summary
                </span>
                <p className="text-slate-200 leading-relaxed font-medium">
                  {aiSummaryReport.summaryEn}
                </p>
              </div>

              {/* Action Items */}
              {aiSummaryReport.actionItems && aiSummaryReport.actionItems.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-200">📌 후속 조치 및 과제 (Action Items)</h4>
                  <div className="space-y-1.5">
                    {aiSummaryReport.actionItems.map((item: any, i: number) => (
                      <div
                        key={i}
                        className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-amber-300 mr-2">[{item.assignee}]</span>
                          <span className="text-slate-200">{item.task}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          기한: {item.dueDate}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowSummaryModal(false)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                확인 및 닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
