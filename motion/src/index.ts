/**
 * Remotion entry point. Hands rendering off to <RemotionRoot /> which
 * registers every composition this workspace exports.
 */

import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root';

registerRoot(RemotionRoot);
