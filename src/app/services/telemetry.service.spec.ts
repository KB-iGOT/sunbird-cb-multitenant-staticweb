import { Injector } from '@angular/core'
import { Subject } from 'rxjs'
import {
  ConfigurationsService,
  EventService as LibEventService,
  LoggerService,
  TelemetryService as LibTelemetryService,
} from '@sunbird-cb/utils-v2'
import { AppTelemetryService } from './telemetry.service'
import { InitService } from './init.service'

/** Stand-in for the global `$t` from @project-sunbird/telemetry-sdk that records events in order. */
function createSdkMock() {
  const calls: { eid: string, edata: any, options: any, contentId?: string }[] = []
  let fingerPrintCallback: ((did: string) => void) | undefined
  let initialized = false
  const record = (eid: string) => (edata: any, options: any) => calls.push({ eid, edata, options })
  return {
    calls,
    fingerPrintId: undefined as string | undefined,
    initialize: jest.fn(() => { initialized = true }),
    isInitialized: () => initialized,
    getFingerPrint: (cb: (did: string) => void) => { fingerPrintCallback = cb },
    resolveFingerPrint: (did: string) => fingerPrintCallback && fingerPrintCallback(did),
    start: jest.fn((_config: any, contentId: string, _ver: string, edata: any, options: any) =>
      calls.push({ eid: 'START', edata, options, contentId })),
    end: jest.fn(record('END')),
    interact: jest.fn(record('INTERACT')),
    impression: jest.fn(record('IMPRESSION')),
  }
}

const TENANT_TELEMETRY_CONFIG = {
  pdata: { id: 'adikarmayogi-microsite', ver: '4.8.10', pid: 'adikarmayogi-microsite' },
  env: 'prod',
  channel: 'igot',
  batchsize: 10,
  object: {},
  endpoint: 'api/data/v1/public/telemetry',
  publicEndpoint: 'apis/data/v1/public/telemetry',
  protectedEndpoint: 'apis/protected/v8/user/telemetry',
}

describe('AppTelemetryService', () => {
  let sdk: ReturnType<typeof createSdkMock>
  let configSvc: ConfigurationsService

  /**
   * Uses the real utils-v2 TelemetryService and EventService, built directly rather than through
   * TestBed so the spec also runs when the library is npm-linked (which loads a second Angular).
   */
  const createService = (telemetryConfig: any = TENANT_TELEMETRY_CONFIG) => {
    const environment = { name: 'prod' }
    configSvc = new ConfigurationsService()
    const libEvents = new LibEventService(environment, { routeData: { pageId: '', module: '' } } as any)
    let libTelemetry: LibTelemetryService | undefined
    const injector: Partial<Injector> = {
      get: ((token: any) => {
        if (token === ConfigurationsService) { return configSvc }
        if (token === LibEventService) { return libEvents }
        if (token === LibTelemetryService) {
          // Created lazily, like the root injector does, so it reads the config set by initialize().
          libTelemetry = libTelemetry || new LibTelemetryService(
            configSvc, libEvents, environment, new LoggerService(configSvc),
            { events: new Subject() } as any, { updateTelemetryData: jest.fn() } as any,
          )
          return libTelemetry
        }
        throw new Error(`Unexpected token ${token}`)
      }) as any,
    }
    const initSvc = {
      appConfig: { telmetryUrl: 'https://portal.example.com/' },
      configDetails: telemetryConfig ? { telemetryConfig } : {},
    } as unknown as InitService
    const service = new AppTelemetryService(injector as Injector, initSvc)
    service.initialize()
    return service
  }

  const eids = () => sdk.calls.map(c => c.eid)

  beforeEach(() => {
    jest.useFakeTimers()
    sessionStorage.clear()
    localStorage.clear()
    sdk = createSdkMock();
    (globalThis as any).$t = sdk
  })

  afterEach(() => {
    jest.useRealTimers()
    delete (globalThis as any).$t
  })

  it('posts to the tenant endpoint on the site origin, not the portal host', () => {
    createService()
    const config: any = configSvc.instanceConfig!.telemetryConfig

    expect(config.endpoint).toBe('/api/data/v1/public/telemetry')
    expect(config.publicEndpoint).toBe('/api/data/v1/public/telemetry')
    expect(config.host).toBe('')
    expect(config.apislug).toBe('')
  })

  it('initializes the SDK with the device id and the library config once the fingerprint resolves', () => {
    createService()
    sdk.resolveFingerPrint('device-1')

    expect(sdk.fingerPrintId).toBe('device-1')
    expect(sdk.initialize).toHaveBeenCalledWith(expect.objectContaining({
      did: 'device-1',
      channel: 'igot',
      pdata: expect.objectContaining({ id: 'prod.adikarmayogi-microsite' }),
      endpoint: '/api/data/v1/public/telemetry',
    }))
  })

  it('sends the page impression through the library, wrapped in START and END', () => {
    const service = createService()
    sdk.resolveFingerPrint('device-1')

    service.raiseImpression()

    expect(eids()).toEqual(['START', 'IMPRESSION', 'END'])
    expect(sdk.calls[1].edata.pageid).toBe('/')
    expect(sdk.calls[1].options.context.env).toBe('Non-loggedin Page')
    expect(sdk.calls[1].options.object).toEqual({})
  })

  it('sends the chatbot-open impression with type page and its subtype', () => {
    const service = createService()
    sdk.resolveFingerPrint('device-1')

    service.raiseImpression({ subtype: 'chatbot-open' })

    expect(eids()).toEqual(['START', 'IMPRESSION', 'END'])
    expect(sdk.calls[1].edata).toEqual({ type: 'page', subtype: 'chatbot-open', pageid: '/', uri: window.location.pathname })
    expect(sdk.calls[1].options.context).toEqual({
      pdata: expect.objectContaining({ id: 'prod.adikarmayogi-microsite' }),
      env: 'Non-loggedin Page',
    })
  })

  it('sends the interact through the library listener, wrapped in START and END', () => {
    const service = createService()
    sdk.resolveFingerPrint('device-1')

    service.raiseInteract({ type: 'click', subtype: 'Jago', id: 'chatbot-open' })

    expect(eids()).toEqual(['START', 'INTERACT', 'END'])
    expect(sdk.calls[1].edata).toEqual({ type: 'click', subtype: 'Jago', id: 'chatbot-open', pageid: '/' })
    expect(sdk.calls[1].options.context.env).toBe('Non-loggedin Page')
    expect(sdk.calls[1].options.object).toEqual({})
  })

  it('sends grouped events in order between a single START and END', () => {
    const service = createService()
    sdk.resolveFingerPrint('device-1')

    service.raiseEvents([
      { eid: 'INTERACT', edata: { type: 'click', subtype: 'Jago', id: 'chatbot-open' } },
      { eid: 'IMPRESSION', edata: { subtype: 'chatbot-open' } },
    ])

    expect(eids()).toEqual(['START', 'INTERACT', 'IMPRESSION', 'END'])
    expect(sdk.calls[1].edata).toEqual({ type: 'click', subtype: 'Jago', id: 'chatbot-open', pageid: '/' })
    expect(sdk.calls[2].edata).toEqual({ type: 'page', subtype: 'chatbot-open', pageid: '/', uri: window.location.pathname })
    expect(sdk.calls[1].options.context.env).toBe('Non-loggedin Page')
    expect(sdk.calls[2].options.context.env).toBe('Non-loggedin Page')
  })

  it('still sends the other grouped events and the END when one event fails', () => {
    const service = createService()
    sdk.resolveFingerPrint('device-1')
    const log = jest.spyOn(console, 'log').mockImplementation(() => {})
    sdk.interact.mockImplementationOnce(() => { throw new Error('boom') })

    service.raiseEvents([
      { eid: 'INTERACT', edata: { type: 'click', id: 'chatbot-open' } },
      { eid: 'IMPRESSION', edata: { subtype: 'chatbot-open' } },
    ])

    expect(eids()).toEqual(['START', 'IMPRESSION', 'END'])
    log.mockRestore()
  })

  it('holds grouped events until the device id is known, keeping them in one START and END', () => {
    const service = createService()

    service.raiseEvents([
      { eid: 'INTERACT', edata: { type: 'click', id: 'chatbot-open' } },
      { eid: 'IMPRESSION', edata: { subtype: 'chatbot-open' } },
    ])
    expect(sdk.calls).toEqual([])

    sdk.resolveFingerPrint('device-1')

    expect(eids()).toEqual(['START', 'INTERACT', 'IMPRESSION', 'END'])
  })

  it('sends nothing for an empty group', () => {
    const service = createService()
    sdk.resolveFingerPrint('device-1')

    service.raiseEvents([])

    expect(sdk.calls).toEqual([])
  })

  it('starts sessions as an anonymous user without a content id', () => {
    const service = createService()
    sdk.resolveFingerPrint('device-1')

    service.raiseImpression()

    const start = sdk.calls[0]
    expect(start.contentId).toBe('')
    expect(start.edata).toEqual(expect.objectContaining({ type: 'Page', mode: 'View' }))
    expect(start.options.actor).toEqual({ id: '', type: 'AnonymousUser' })
    expect(start.options.context.env).toBe('Non-loggedin Page')
  })

  it('holds events until the device id is known, then sends them in order', () => {
    const service = createService()

    service.raiseImpression()
    service.raiseInteract({ type: 'click', id: 'chatbot-open' })
    expect(sdk.calls).toEqual([])

    sdk.resolveFingerPrint('device-1')

    expect(eids()).toEqual(['START', 'IMPRESSION', 'END', 'START', 'INTERACT', 'END'])
  })

  it('falls back to a generated device id if the fingerprint never resolves', () => {
    const service = createService()
    service.raiseImpression()

    jest.advanceTimersByTime(5000)

    expect(sdk.fingerPrintId).toEqual(expect.any(String))
    expect(eids()).toEqual(['START', 'IMPRESSION', 'END'])

    sdk.resolveFingerPrint('late-device')
    expect(sdk.fingerPrintId).not.toBe('late-device')
  })

  it('creates a session id for the browser session and shares it with the library', () => {
    createService()
    const sid = sessionStorage.getItem('telemetrySessionId')

    expect(sid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    expect(localStorage.getItem('telemetrySessionId')).toBe(sid)
    sdk.resolveFingerPrint('device-1')
    expect(sdk.initialize).toHaveBeenCalledWith(expect.objectContaining({ sid }))
  })

  it('keeps the session id for the rest of the browser session', () => {
    sessionStorage.setItem('telemetrySessionId', 'existing-sid')
    createService()
    expect(localStorage.getItem('telemetrySessionId')).toBe('existing-sid')
  })

  it('sends nothing when the tenant has no telemetry config', () => {
    const service = createService(null)

    service.raiseImpression()
    jest.advanceTimersByTime(5000)

    expect(sdk.calls).toEqual([])
    expect(sdk.initialize).not.toHaveBeenCalled()
  })
})
