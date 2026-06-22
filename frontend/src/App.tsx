import { useReducer, useRef } from 'react';
import { initialState, reducer } from './state';
import { CandidateScreen, JobScreen, ProgressScreen, ReportScreen } from './screens';
import { createAnalysis, fetchReport, streamEvents, ValidationError } from './api';
import { AppShell } from './components/core/AppShell';

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const closeStream = useRef<(() => void) | null>(null);

  const run = async () => {
    try {
      const id = await createAnalysis(state.job, state.candidate);
      dispatch({ type: 'started', analysisId: id });
      closeStream.current = streamEvents(
        id,
        (ev) => dispatch({ type: 'stage', event: ev }),
        async () => {
          try {
            const report = await fetchReport(id);
            dispatch({ type: 'completed', report });
          } catch (err) {
            dispatch({ type: 'failed', error: (err as Error).message });
          }
        },
      );
    } catch (err) {
      if (err instanceof ValidationError) {
        dispatch({ type: 'fieldErrors', errors: err.errors });
        dispatch({ type: 'backToJob' });
      } else {
        dispatch({ type: 'failed', error: (err as Error).message });
      }
    }
  };

  const reset = () => {
    closeStream.current?.();
    closeStream.current = null;
    dispatch({ type: 'reset' });
  };

  return (
    <AppShell current={state.step}>
      {state.step === 'job' && (
        <JobScreen state={state} dispatch={dispatch} onContinue={() => dispatch({ type: 'goToCandidate' })} />
      )}
      {state.step === 'candidate' && (
        <CandidateScreen state={state} dispatch={dispatch} onBack={() => dispatch({ type: 'backToJob' })} onRun={run} />
      )}
      {state.step === 'progress' && <ProgressScreen state={state} />}
      {state.step === 'report' && state.report && state.analysisId && (
        <ReportScreen report={state.report} analysisId={state.analysisId} onReset={reset} />
      )}
    </AppShell>
  );
}
