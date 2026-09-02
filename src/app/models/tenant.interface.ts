export interface TenantAppConfig {
  contentBucket: string;
  contentHost: string;
  baseUrl: string;
  portalURL: string;
  learnerPortalURL: string;
  telmetryUrl: string;
}

export interface TenantTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
}

export interface TenantBranding {
  logo: string;
  favicon: string;
  companyName: string;
}

/**
 * What a navigation item does when it is clicked:
 * - 'link'     opens `url`, in a new tab unless `newTab` is false
 * - 'scroll'   smooth scrolls to the section named by `sectionId`
 * - 'copy'     copies `copyText` (or the label) to the clipboard
 * - 'language' renders the language picker instead of a link
 */
export type TenantNavigationType = 'link' | 'scroll' | 'copy' | 'language';

export interface TenantNavigation {
  label: string;
  /** Material icon name shown before the label. */
  icon?: string;
  /**
   * Show/hide the item. Defaults to true. The form configuration has used
   * `active`, `enable` and `enabled` for this flag, all three are honoured.
   */
  active?: boolean;
  enable?: boolean;
  enabled?: boolean;
  /** Defaults to 'language' for a "Language" label and to 'link' otherwise. */
  type?: TenantNavigationType;
  /**
   * 'link': url to open. For the other types it is the fallback of the field
   * they use, so a configuration that only carries a url keeps working.
   */
  url?: string;
  /** 'link' only: open the url in a new tab. Defaults to true. */
  newTab?: boolean;
  /**
   * 'scroll' only: id of the section to scroll to, with or without a leading '#'.
   * Falls back to `url`. The landing page exposes 'hero', 'photoGallery',
   * 'trainingPrograms', 'internationalTraining', 'partners', 'showcasedCourses'
   * and 'footer'.
   */
  sectionId?: string;
  /** 'copy' only: text put on the clipboard. Falls back to the label, then to `url`. */
  copyText?: string;
  /** 'copy' only: label shown for a moment after copying. Defaults to 'Copied!'. */
  copiedLabel?: string;
}

/** `TenantNavigation` after defaults are applied, ready for the template. */
export interface ResolvedNavItem {
  label: string;
  icon: string;
  type: TenantNavigationType;
  url: string;
  newTab: boolean;
  sectionId: string;
  copyText: string;
  copiedLabel: string;
}

export interface TenantFeature {
  title: string;
  description: string;
  icon: string;
}

export interface TenantStatistic {
  value: string;
  label: string;
}

export interface TenantTitleAccent {
  /** Show/hide the accent image next to the section title. Defaults to true. */
  active?: boolean;
  /** Accent image url. Falls back to the bundled tricolor asset for the chosen position/rotation. */
  image?: string;
  /** Accent placement relative to the title. Defaults to 'left'. */
  position?: 'left' | 'top';
  /**
   * Rotates the accent image by 90deg, so a horizontal image can be used as a
   * vertical bar for `position: left` (and a vertical one as a top bar).
   */
  rotate?: boolean;
  /** Bar length in px along the title - height for 'left', width for 'top'. Defaults to 96. */
  length?: number;
  /** Bar thickness in px. Defaults to 12. */
  thickness?: number;
}

/** `TenantTitleAccent` after defaults are applied, ready for the template. */
export interface ResolvedTitleAccent {
  active: boolean;
  image: string;
  position: 'left' | 'top';
  rotate: boolean;
  /** Size of the accent box */
  barStyle: { [key: string]: string };
  /** Size of the image inside the box - axes swapped when rotated */
  imageStyle: { [key: string]: string };
}

export interface TenantImage {
  url: string;
  alt: string;
  caption: string;
}

export interface TenantLoginButton {
  text?: string;
  link?: string;
  /** Button background. Falls back to the theme colour. */
  backgroundColor?: string;
  /** Button label colour. Falls back to the theme colour. */
  textColor?: string;
}

export interface TenantGalleryDecoration {
  /** Show/hide the dotted pattern and the tinted circle behind the gallery. Defaults to true. */
  active?: boolean;
  /** Dotted pattern image url. Defaults to the bundled gallery-dots.svg, hidden when set to ''. */
  patternImage?: string;
  /** Fill of the circle behind the gallery. Defaults to #039349. */
  circleColor?: string;
  /** Opacity (0-1) of that circle. Defaults to 0.0994. */
  circleOpacity?: number;
}

/** `TenantGalleryDecoration` after defaults are applied, ready for the template. */
export interface ResolvedGalleryDecoration {
  active: boolean;
  patternImage: string;
  circleStyle: { [key: string]: string };
}

export interface TenantPhotoGallery {
  title: string;
  titleAccent?: TenantTitleAccent;
  description: string;
  images: TenantImage[];
  decoration?: TenantGalleryDecoration;
}

export interface TenantProgram {
  icon: string;
  title: string;
  description: string;
  features: string[];
}

export interface TenantTrainingPrograms {
  title: string;
  titleAccent?: TenantTitleAccent;
  subtitle: string;
  programs: TenantProgram[];
}

export interface TenantCountry {
  name: string;
  count: string;
  color: string;
}

export interface TenantInternationalTraining {
  title: string;
  titleAccent?: TenantTitleAccent;
  countries: TenantCountry[];
  mapImage: string;
}

export interface TenantPartnerLogo {
  name: string;
  logo: string;
}

export interface TenantPartners {
  title: string;
  titleAccent?: TenantTitleAccent;
  logos: TenantPartnerLogo[];
}

export interface TenantCourse {
  title: string;
  description: string;
  image: string;
}

export interface TenantShowcasedCourses {
  title: string;
  titleAccent?: TenantTitleAccent;
  courses: TenantCourse[];
}

export interface TenantFooter {
  /** Show/hide the footer image. Defaults to true when a footer block is configured. */
  active?: boolean;
  /** Footer image url - nothing is rendered while this is empty. */
  image?: string;
  /** Alt text for the footer image. */
  alt?: string;
  /**
   * Footer height in px. Without it the image keeps its own aspect ratio, so a
   * wide strip grows as tall as (page width / image ratio).
   */
  height?: number;
  /**
   * How the image fills the footer box once a height is set:
   * 'contain' (default) shows all of it, 'fill' stretches it edge to edge,
   * 'cover' fills the box and crops the overflow.
   */
  fit?: 'contain' | 'fill' | 'cover';
  /** Horizontal alignment inside the footer when the image is narrower than the page. Defaults to 'center'. */
  align?: 'left' | 'center' | 'right';
}

export interface TenantContent {
  title: string;
  subtitle: string;
  heroImage: string;
  description: string;
  ctaButton: string;
  features: TenantFeature[];
  statistics: TenantStatistic[];
  loginButton?: TenantLoginButton;
  /** Default accent for every section title, overridable per section. */
  titleAccent?: TenantTitleAccent;
  photoGallery?: TenantPhotoGallery;
  trainingPrograms?: TenantTrainingPrograms;
  internationalTraining?: TenantInternationalTraining;
  partners?: TenantPartners;
  showcasedCourses?: any;
  footer?: TenantFooter;
}

export interface TenantContact {
  phone: string;
  email: string;
  address: string;
}

export interface TenantConfig {
  id: string;
  name: string;
  appConfig?: Partial<TenantAppConfig>;
  theme: TenantTheme;
  branding: TenantBranding;
  navigation: TenantNavigation[];
  content: TenantContent;
  contact: TenantContact;
  /** Footer block as stored by the form (`content.footer` is also supported). */
  footer?: TenantFooter;
}