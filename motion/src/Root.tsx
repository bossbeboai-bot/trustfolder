/**
 * Composition registry. Every composition this workspace exports must be
 * declared here so `remotion render <id>` can resolve it.
 *
 * See `package.json` `scripts.render:*` for ready-made render commands.
 */

import { Composition } from 'remotion';
import { TrustFolderEvidenceFlow } from './TrustFolderEvidenceFlow/Composition';

const FPS = 30;
const SQUARE = { width: 1080, height: 1080 } as const;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Master 10-second explainer used in sales decks, social posts,
          internal walkthroughs. 1080×1080 square so it embeds anywhere. */}
      <Composition
        id="TrustFolderEvidenceFlow"
        component={TrustFolderEvidenceFlow}
        durationInFrames={10 * FPS}
        fps={FPS}
        {...SQUARE}
      />

      {/* Optional 6-second silent loop trimmed from the master flow.
          Same composition, fewer frames — Remotion ignores frames past
          durationInFrames so there is no rebuild required. */}
      <Composition
        id="TrustFolderHeroLoop"
        component={TrustFolderEvidenceFlow}
        durationInFrames={6 * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />

      {/* 4-second slice covering only the website-scan beat.
          Used on /examples and in agency outbound. */}
      <Composition
        id="WebsiteScan"
        component={TrustFolderEvidenceFlow}
        durationInFrames={4 * FPS}
        fps={FPS}
        {...SQUARE}
      />

      {/* 8-second composition oriented toward agency handoff copy.
          Re-uses the same scenes but emphasises the buyer-handoff card. */}
      <Composition
        id="AgencyHandoff"
        component={TrustFolderEvidenceFlow}
        durationInFrames={8 * FPS}
        fps={FPS}
        {...SQUARE}
      />
    </>
  );
};
