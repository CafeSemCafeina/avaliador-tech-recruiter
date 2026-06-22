// @vitest-environment jsdom
//
// Render smoke test: the existing suite runs in a `node` environment and never
// mounts a component, so a frontend that builds and type-checks cleanly can
// still render a blank page at runtime (a bad import, a throw during render, a
// missing provider). That class of "white screen" passed CI before. This test
// actually mounts <App/> in a DOM and asserts the first screen renders, so a
// crash-on-mount fails the build instead of shipping a blank page.
import { afterEach, expect, test } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import App from './App';

afterEach(cleanup);

test('App mounts and renders the initial Role baseline screen', () => {
  render(<App />);

  // The first screen's heading — proves React mounted and the initial route
  // rendered actual content, not an empty <div id="root">.
  expect(screen.getByRole('heading', { name: /define the role baseline/i })).toBeTruthy();

  // The stepper should show every step label, i.e. the AppShell rendered too.
  for (const label of ['Role baseline', 'Candidate evidence', 'Analysis', 'Report']) {
    expect(screen.getByText(label)).toBeTruthy();
  }
});
