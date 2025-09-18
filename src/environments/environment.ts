// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// Safe access to window.env with fallback values
const getEnvValue = (key: string, fallback: any) => {
  try {
    const windowEnv = (window as { [key: string]: any })['env'];
    return windowEnv && windowEnv[key] !== undefined ? windowEnv[key] : fallback;
  } catch {
    return fallback;
  }
};

export const environment: IEnvironment = {
  name: getEnvValue('name', 'Multi-Tenant Portal'),
  production: getEnvValue('production', false),
  contentHost: getEnvValue('contentHost', 'https://portal.dev.karmayogibharat.net'),
  contentBucket: getEnvValue('contentBucket', 'assets/public'),
  ordId: getEnvValue('ordId', '01376822290813747263'),
  portalURL: getEnvValue('portalURL', 'https://iiidem-portal.dev.karmayogibharat.net'),
  learnerPortalURL: getEnvValue('portalURL', 'https://portal.dev.karmayogibharat.net'),
  telmetryUrl: getEnvValue('telmetryUrl', 'https://iiidem-portal.dev.karmayogibharat.net'),
}
interface IEnvironment {
  name: string,
  production: boolean
  contentHost: null | string
  contentBucket: string
  ordId: string
  portalURL: string
  learnerPortalURL: string
  telmetryUrl: string
}