import { remotionColors } from '../constants';

export function FolderMark({ size = 116 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 116 116" aria-hidden>
      <rect x="12" y="30" width="70" height="64" rx="10" fill={remotionColors.greenDark} />
      <rect x="24" y="24" width="76" height="70" rx="11" fill={remotionColors.greenLight} />
      <rect x="32" y="34" width="72" height="62" rx="11" fill={remotionColors.green} />
      <path
        d="M48 66 L61 78 L83 50"
        fill="none"
        stroke={remotionColors.white}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

