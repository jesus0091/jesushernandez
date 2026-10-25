// Single icon source for the site: Phosphor, duotone weight.
// Import icons from here (never from @phosphor-icons/react directly) so the
// weight and default size stay consistent everywhere.
import type { ComponentType } from "react";
import type { IconProps } from "@phosphor-icons/react";
import {
  ArrowClockwise as PArrowClockwise,
  ArrowDown as PArrowDown,
  ArrowLeft as PArrowLeft,
  ArrowRight as PArrowRight,
  ArrowUp as PArrowUp,
  ArrowUpRight as PArrowUpRight,
  BehanceLogo as PBehanceLogo,
  BookOpenText as PBookOpenText,
  Code as PCode,
  Compass as PCompass,
  Devices as PDevices,
  Envelope as PEnvelope,
  FlowArrow as PFlowArrow,
  Gauge as PGauge,
  GithubLogo as PGithubLogo,
  House as PHouse,
  LinkedinLogo as PLinkedinLogo,
  ListChecks as PListChecks,
  MagnifyingGlass as PMagnifyingGlass,
  Palette as PPalette,
  PenNib as PPenNib,
  Check as PCheck,
  Database as PDatabase,
  CreditCard as PCreditCard,
  Sparkle as PSparkle,
  DeviceMobile as PDeviceMobile,
  ArrowsClockwise as PArrowsClockwise,
  Bell as PBell,
  Storefront as PStorefront,
  Pause as PPause,
  Plus as PPlus,
  Play as PPlay,
  Question as PQuestion,
  RocketLaunch as PRocketLaunch,
  SpeakerHigh as PSpeakerHigh,
  SpeakerSlash as PSpeakerSlash,
  TreeStructure as PTreeStructure,
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
export const ArrowDown = duotone(PArrowDown);
export const ArrowLeft = duotone(PArrowLeft);
export const ArrowRight = duotone(PArrowRight);
export const ArrowUp = duotone(PArrowUp);
export const ArrowUpRight = duotone(PArrowUpRight);
export const BehanceLogo = duotone(PBehanceLogo);
export const BookOpenText = duotone(PBookOpenText);
export const Code = duotone(PCode);
export const Compass = duotone(PCompass);
export const Devices = duotone(PDevices);
export const Envelope = duotone(PEnvelope);
export const FlowArrow = duotone(PFlowArrow);
export const Pause = duotone(PPause);
export const Play = duotone(PPlay);
export const Plus = duotone(PPlus);
export const Check = duotone(PCheck);
export const Database = duotone(PDatabase);
export const CreditCard = duotone(PCreditCard);
export const Sparkle = duotone(PSparkle);
export const DeviceMobile = duotone(PDeviceMobile);
export const ArrowsClockwise = duotone(PArrowsClockwise);
export const Bell = duotone(PBell);
export const Storefront = duotone(PStorefront);
export const Gauge = duotone(PGauge);
export const GithubLogo = duotone(PGithubLogo);
export const House = duotone(PHouse);
export const LinkedinLogo = duotone(PLinkedinLogo);
export const ListChecks = duotone(PListChecks);
export const MagnifyingGlass = duotone(PMagnifyingGlass);
export const Palette = duotone(PPalette);
export const PenNib = duotone(PPenNib);
export const Question = duotone(PQuestion);
export const RocketLaunch = duotone(PRocketLaunch);
export const SpeakerHigh = duotone(PSpeakerHigh);
export const SpeakerSlash = duotone(PSpeakerSlash);
export const TreeStructure = duotone(PTreeStructure);
export const User = duotone(PUser);
export const Users = duotone(PUsers);
export const Warning = duotone(PWarning);
