export type Kingdom = 'Animalia' | 'Plantae' | 'Fungi';

export type ColombianRegion = 
  | 'Andina' 
  | 'Caribe' 
  | 'Pacífica' 
  | 'Amazonía' 
  | 'Orinoquía' 
  | 'Insular';

export type ConservationStatus = 'CR' | 'EN' | 'VU' | 'NT' | 'LC';

export type EndemicLevel = 
  | 'Endémica Estricta de Colombia' 
  | 'Cuasi-endémica' 
  | 'Nativa Emblemática';

export interface TaxonomyInfo {
  kingdom: Kingdom;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
}

export interface ReliableSource {
  name: string;
  institution: 'Instituto Humboldt' | 'UICN Red List' | 'SiB Colombia' | 'Parques Nacionales' | 'Universidad Nacional';
  year: number;
  url?: string;
  citation: string;
}

export interface Species {
  id: string;
  commonName: string;
  scientificName: string;
  englishName: string;
  category: 'Fauna' | 'Flora';
  taxonomy: TaxonomyInfo;
  endemicLevel: EndemicLevel;
  conservationStatus: ConservationStatus;
  region: ColombianRegion;
  department: string[];
  habitat: string;
  elevationRange: string;
  coordinates: {
    lat: number;
    lng: number;
    locationName: string;
  };
  characteristics: string[];
  ecologicalRole: string;
  threats: string[];
  curiousFact: string;
  sources: ReliableSource[];
  imageUrl: string;
  habitatImageUrl?: string;
  gallery?: string[];
  imageAttribution: string;
  isCoreProjectSpecies: boolean; // The 4 species spotlighted in Project Point 5
  projectSpotlightReason?: string;
  soundDescription?: string;
}

export interface Sighting {
  id: string;
  speciesId: string;
  speciesCommonName: string;
  scientificName: string;
  category: 'Fauna' | 'Flora';
  observerName: string;
  observerRole: 'Biólogo de Campo' | 'Guardaparques' | 'Líder Comunitario' | 'Fotógrafo de Naturaleza' | 'Explorador';
  timestamp: string;
  coordinates: {
    lat: number;
    lng: number;
    locationName: string;
  };
  isCoordinatesFuzzedForProtection: boolean; // E2EE / anti-poaching security
  encryptionHash: string;
  notes: string;
  photoUrl: string;
  countObserved: number;
  habitatType: string;
  weather: string;
  status: 'synced' | 'pending_sync' | 'verified';
  syncedAt?: string;
  verifiedBy?: string;
}

export interface SurveyResponse {
  id: string;
  timestamp: string;
  participantAge: string;
  department: string;
  speciesEvaluated: string;
  knewSpeciesBefore: boolean;
  knewItWasEndemic: boolean;
  participantName?: string;
  userId?: string;
  username?: string;
  evaluableScore?: number;
  evaluablePercentage?: number;
  isApproved?: boolean;
  badgeAwarded?: string;
  levelAchieved?: string;
  unknownInfoAspect: string;
  interestScore: number; // 1 to 5
  learnedSomethingNew: boolean;
  increasedPrideInBiodiversity: boolean;
  willingnessToProtect: number; // 1 to 5
  feedbackComment?: string;
}

export type BadgeLevel = 'bronce' | 'plata' | 'oro' | 'platino' | 'leyenda';

export interface BadgeDefinition {
  id: string;
  level: BadgeLevel;
  levelName: string;
  name: string;
  title: string;
  description: string;
  focusArea: string;
  totalQuestions: number;
  minScorePercent: number;
  badgeColor: string;
  badgeBorder: string;
  badgeIconBg: string;
}

export interface UserBadge {
  badgeId: string;
  level: BadgeLevel;
  unlockedAt: string;
  scorePercent: number;
  evaluationId?: string;
}

export interface UserDiploma {
  id: string;
  certificateNumber: string;
  userId: string;
  username: string;
  badgeLevel: BadgeLevel;
  badgeName: string;
  subject: string;
  score: number;
  maxScore: number;
  scorePercentage: number;
  issuedAt: string;
  recognitionText: string;
}

export interface EvaluationAttempt {
  id: string;
  userId: string;
  username: string;
  level: BadgeLevel;
  levelName: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  approved: boolean;
  minScoreRequired: number;
  timestamp: string;
  badgeAwarded?: string;
  diplomaId?: string;
  answersSummary?: Array<{
    question: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
  }>;
}

export interface UserAccount {
  id: string;
  username: string;
  role: 'student' | 'admin';
  createdAt: string;
  preferredPalette?: string;
  badges: UserBadge[];
  diplomas: UserDiploma[];
}

export interface QuizResult {
  id: string;
  timestamp: string;
  participantName: string;
  userId?: string;
  username?: string;
  activityType: 'quiz' | 'trivia' | 'evaluation';
  activityName: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  approved?: boolean;
  badgeAwarded?: string;
  questionsSummary?: Array<{
    question: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  speciesId?: string;
  distanceKm: number;
  timestamp: string;
  read: boolean;
  type: 'sighting' | 'sync' | 'conservation_alert';
  locationName: string;
}

export interface FilterState {
  searchQuery: string;
  category: 'all' | 'Fauna' | 'Flora';
  region: 'all' | ColombianRegion;
  conservationStatus: 'all' | ConservationStatus;
  onlyEndemic: boolean;
  onlyCoreFour: boolean;
  kingdom: 'all' | Kingdom;
  selectedFamily: string;
}
