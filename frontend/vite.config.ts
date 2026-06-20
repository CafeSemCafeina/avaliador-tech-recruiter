import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Allow importing the design system that lives at the repo root (one level up).
  server: { fs: { allow: ['..'] } },
  test: { environment: 'node' },
});
