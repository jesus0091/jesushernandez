// Single icon source for the site: Phosphor, duotone weight.
// Import icons from here (never from @phosphor-icons/react directly) so the
// weight and default size stay consistent everywhere.
import type { ComponentType } from "react";
import type { IconProps } from "@phosphor-icons/react";
import {
  ArrowClockwise as PArrowClockwise,
  ArrowLeft as PArrowLeft,
  ArrowRight as PArrowRight,
  ArrowUp as PArrowUp,
  ArrowUpRight as PArrowUpRight,
  BehanceLogo as PBehanceLogo,
  BookOpenText as PBookOpenText,
  Envelope as PEnvelope,
  FlowArrow as PFlowArrow,
  GithubLogo as PGithubLogo,
  House as PHouse,
  LinkedinLogo as PLinkedinLogo,
  PenNib as PPenNib,
  Question as PQuestion,
  Sparkle as PSparkle,
  SpeakerHigh as PSpeakerHigh,
  SpeakerSlash as PSpeakerSlash,
  User as PUser,
  Users as PUsers,
  Warning as PWarning,
} from "@phosphor-icons/react/dist/ssr";

export type { IconProps };

function duotone(Icon: ComponentType<IconProps>) {
  function DuotoneIcon(props: IconProps) {
    return <Icon weight="duotone" size={24} {...props} />;
  }
  return DuotoneIcon;
}

export const ArrowClockwise = duotone(PArrowClockwise);
export const ArrowLeft = duotone(PArrowLeft);
export const ArrowRight = duotone(PArrowRight);
export const ArrowUp = duotone(PArrowUp);
export const ArrowUpRight = duotone(PArrowUpRight);
export const BehanceLogo = duotone(PBehanceLogo);
export const BookOpenText = duotone(PBookOpenText);
export const Envelope = duotone(PEnvelope);
export const FlowArrow = duotone(PFlowArrow);
export const GithubLogo = duotone(PGithubLogo);
export const House = duotone(PHouse);
export const LinkedinLogo = duotone(PLinkedinLogo);
export const PenNib = duotone(PPenNib);
export const Question = duotone(PQuestion);
export const Sparkle = duotone(PSparkle);
export const SpeakerHigh = duotone(PSpeakerHigh);
export const SpeakerSlash = duotone(PSpeakerSlash);
export const User = duotone(PUser);
export const Users = duotone(PUsers);
export const Warning = duotone(PWarning);
