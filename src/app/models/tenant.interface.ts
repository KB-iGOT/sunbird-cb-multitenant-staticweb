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

export interface TenantNavigation {
  label: string;
  url: string;
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

export interface TenantImage {
  url: string;
  alt: string;
  caption: string;
}

export interface TenantPhotoGallery {
  title: string;
  description: string;
  images: TenantImage[];
}

export interface TenantProgram {
  icon: string;
  title: string;
  description: string;
  features: string[];
}

export interface TenantTrainingPrograms {
  title: string;
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
  countries: TenantCountry[];
  mapImage: string;
}

export interface TenantPartnerLogo {
  name: string;
  logo: string;
}

export interface TenantPartners {
  title: string;
  logos: TenantPartnerLogo[];
}

export interface TenantCourse {
  title: string;
  description: string;
  image: string;
}

export interface TenantShowcasedCourses {
  title: string;
  courses: TenantCourse[];
}

export interface TenantContent {
  title: string;
  subtitle: string;
  heroImage: string;
  description: string;
  ctaButton: string;
  features: TenantFeature[];
  statistics: TenantStatistic[];
  photoGallery?: TenantPhotoGallery;
  trainingPrograms?: TenantTrainingPrograms;
  internationalTraining?: TenantInternationalTraining;
  partners?: TenantPartners;
  showcasedCourses?: TenantShowcasedCourses;
}

export interface TenantContact {
  phone: string;
  email: string;
  address: string;
}

export interface TenantConfig {
  id: string;
  name: string;
  portalURL: string;
  theme: TenantTheme;
  branding: TenantBranding;
  navigation: TenantNavigation[];
  content: TenantContent;
  contact: TenantContact;
}