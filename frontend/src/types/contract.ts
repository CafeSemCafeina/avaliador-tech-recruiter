// Data contracts mirrored 1:1 from the Go structs in
// backend/internal/contract (PRD §14, TECHNICAL_DESIGN §5/§6). Field names are
// camelCase on the wire so Go and TS share one shape. The UI renders from this
// JSON — never from the Markdown export.
//
// By ADR-0002 there is intentionally no score/rating/fit/percentage field and
// no numeric fit value anywhere. Do not add one.

export type Seniority = 'intern' | 'junior' | 'mid' | 'senior' | 'staff';

export type Quadrant =
  | 'strong_with_evidence'
  | 'strong_needs_validation'
  | 'weak_with_evidence'
  | 'weak_needs_validation';

export type SourceKind = 'resume' | 'github' | 'linkedin' | 'portfolio' | 'job';

export interface JobInput {
  description: string;
  seniority: Seniority;
  yearsExperience: number | null;
  stackTags: string[];
  primaryStacks: string[]; // subset of stackTags, max 3
  notes: string;
}

export interface CandidateInput {
  resumeText: string;
  linkedinText: string;
  githubUrl: string;
  portfolioUrl: string;
  notes: string;
}

export interface Source {
  kind: SourceKind;
  detail: string;
}

export interface QuadrantItem {
  title: string;
  quadrant: Quadrant;
  sources: Source[];
  rationale: string;
  interviewFocus: string;
  starRefs?: string[];
}

export interface Finding {
  statement: string;
  sources: Source[];
}

export interface ValidationItem {
  statement: string;
  interviewFocus: string;
  sources?: Source[];
}

export interface Badge {
  label: string;
  tone: string;
}

export interface STARQuestion {
  id: string;
  dimension: string;
  question: string;
}

export interface MethodologyStep {
  stage: string;
  name: string;
  status: string;
  durationMs?: number;
}

export interface Report {
  seniority: Seniority;
  executiveSummary: string;
  badges: Badge[];
  evidenceMatrix: QuadrantItem[];
  confirmedStrengths: Finding[];
  strengthsNeedingValidation: ValidationItem[];
  confirmedGaps: Finding[];
  weakSignalsNeedingValidation: ValidationItem[];
  starQuestions: STARQuestion[];
  recruiterSummary: string;
  hiringManagerSummary: string;
  methodology: MethodologyStep[];
  limitations: string[];
}

export const QUADRANTS: Quadrant[] = [
  'strong_with_evidence',
  'strong_needs_validation',
  'weak_with_evidence',
  'weak_needs_validation',
];

export const SENIORITIES: Seniority[] = ['intern', 'junior', 'mid', 'senior', 'staff'];
