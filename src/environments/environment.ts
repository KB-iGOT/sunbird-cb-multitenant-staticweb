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
  contentHost: getEnvValue('contentHost', ''),
  contentBucket: getEnvValue('contentBucket', 'assets/public'),
  baseUrl: getEnvValue('baseUrl', ''),
  portalURL: getEnvValue('portalURL', ''),
  learnerPortalURL: getEnvValue('portalURL', ''),
  telmetryUrl: getEnvValue('telmetryUrl', ''),
}
interface IEnvironment {
  name: string,
  production: boolean
  contentHost: null | string
  contentBucket: string
  baseUrl: string,
  portalURL: string
  learnerPortalURL: string
  telmetryUrl: string
}
