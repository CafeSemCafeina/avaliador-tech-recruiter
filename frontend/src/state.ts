// Single-page flow state. The analysis lifecycle is a state machine, modelled
// here with useReducer (no React Router in the MVP — the four screens are steps
// driven by reducer state).
import type { CandidateInput, JobInput, Report, StageEvent } from './types/contract';
import type { FieldErrors } from './api';

export type Step = 'job' | 'candidate' | 'progress' | 'report';

export interface AppState {
  step: Step;
  job: JobInput;
  candidate: CandidateInput;
  analysisId: string | null;
  stages: StageEvent[];
  report: Report | null;
  error: string | null;
  fieldErrors: FieldErrors;
}

export const emptyJob: JobInput = {
  description: '',
  seniority: 'mid',
  yearsExperience: null,
  stackTags: [],
  primaryStacks: [],
  notes: '',
};

export const emptyCandidate: CandidateInput = {
  resumeText: '',
  linkedinText: '',
  githubUrl: '',
  portfolioUrl: '',
  notes: '',
};

export const initialState: AppState = {
  step: 'job',
  job: emptyJob,
  candidate: emptyCandidate,
  analysisId: null,
  stages: [],
  report: null,
  error: null,
  fieldErrors: {},
};

export type Action =
  | { type: 'setJob'; job: JobInput }
  | { type: 'setCandidate'; candidate: CandidateInput }
  | { type: 'goToCandidate' }
  | { type: 'backToJob' }
  | { type: 'started'; analysisId: string }
  | { type: 'stage'; event: StageEvent }
  | { type: 'completed'; report: Report }
  | { type: 'failed'; error: string }
  | { type: 'fieldErrors'; errors: FieldErrors }
  | { type: 'reset' };

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'setJob':
      return { ...state, job: action.job };
    case 'setCandidate':
      return { ...state, candidate: action.candidate };
    case 'goToCandidate':
      return { ...state, step: 'candidate', fieldErrors: {} };
    case 'backToJob':
      return { ...state, step: 'job' };
    case 'started':
      return { ...state, step: 'progress', analysisId: action.analysisId, stages: [], error: null, fieldErrors: {} };
    case 'stage': {
      // Keep the latest event per stage id, preserving first-seen order.
      const others = state.stages.filter((s) => s.stage !== action.event.stage);
      return { ...state, stages: [...others, action.event] };
    }
    case 'completed':
      return { ...state, step: 'report', report: action.report };
    case 'failed':
      return { ...state, error: action.error };
    case 'fieldErrors':
      return { ...state, fieldErrors: action.errors };
    case 'reset':
      return initialState;
    default:
      return state;
  }
}
