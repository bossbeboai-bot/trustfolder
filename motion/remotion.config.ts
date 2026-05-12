/**
 * Remotion build config for the TrustFolder motion workspace.
 *
 * The compositions are registered in `src/Root.tsx` via `<Composition />`.
 * This config only wires up the renderer — it does not couple to the
 * Next.js app at all.
 */

import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setEntryPoint('./src/index.ts');
