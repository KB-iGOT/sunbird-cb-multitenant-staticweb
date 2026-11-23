import { Injectable, Injector } from '@angular/core'
import {
  ConfigurationsService,
  EventService as LibEventService,
  TelemetryService as LibTelemetryService,
  WsEvents,
} from '@sunbird-cb/utils-v2'
import { InitService } from './init.service'

declare var $t: any

/** Page context for events raised on the public (non-logged-in) landing page. */
export const NON_LOGGEDIN_PAGE_CONTEXT: WsEvents.ITelemetryPageContext = {
  pageId: '/',
  module: 'Non-loggedin Page',
}

export interface ITelemetryInteractData {
  type: string
  subtype?: string
  id: string
}

export interface ITelemetryImpressionData {
  subtype?: string
}

/** One event for `raiseEvents`. */
export type ITelemetryEvent =
  | { eid: 'INTERACT', edata: ITelemetryInteractData }
  | { eid: 'IMPRESSION', edata?: ITelemetryImpressionData }

const TELEMETRY_SESSION_ID_KEY = 'telemetrySessionId'
/** How long to wait for the SDK's device fingerprint before falling back to a generated device id. */
const DEVICE_ID_TIMEOUT_MS = 5000
const SESSION_EDATA = { type: WsEvents.WsTimeSpentType.Page, mode: WsEvents.WsTimeSpentMode.View }

/**
 * Connects this app to the telemetry service in `@sunbird-cb/utils-v2` and adds what the
 * anonymous landing page needs on top of it:
 * - the library's instance config, pointed at the public telemetry endpoint,
 * - a telemetry session id (`sid`) per browser session,
 * - every event (or every group of events from one user action) wrapped in a START and END,
 *   so the SDK uploads it immediately.
 */
@Injectable({
  providedIn: 'root',
})
export class AppTelemetryService {
  private telemetry: LibTelemetryService | null = null
  private libEvents: LibEventService | null = null
  private deviceIdReady = false
  private pendingEvents: (() => void)[] = []

  constructor(private injector: Injector, private initSvc: InitService) {}

  /** Call once, after the tenant configuration has loaded. */
  initialize() {
    if (this.telemetry || typeof $t === 'undefined') {
      return
    }
    const telemetryConfig = this.buildTelemetryConfig()
    if (!telemetryConfig) {
      return
    }
    this.ensureTelemetrySessionId()
    // The library reads its configuration (and the session id) once, when it is first created.
    const configSvc = this.injector.get(ConfigurationsService)
    configSvc.instanceConfig = { ...(configSvc.instanceConfig || {}), telemetryConfig } as any
    this.telemetry = this.injector.get(LibTelemetryService)
    this.libEvents = this.injector.get(LibEventService)
    this.resolveDeviceId()
  }

  /** Raises an INTERACT event, wrapped in its own START and END. */
  raiseInteract(edata: ITelemetryInteractData, pageContext = NON_LOGGEDIN_PAGE_CONTEXT) {
    this.raiseEvents([{ eid: 'INTERACT', edata }], pageContext)
  }

  /** Raises an IMPRESSION event, wrapped in its own START and END. */
  raiseImpression(edata: ITelemetryImpressionData = {}, pageContext = NON_LOGGEDIN_PAGE_CONTEXT) {
    this.raiseEvents([{ eid: 'IMPRESSION', edata }], pageContext)
  }

  /**
   * Raises several events, in the order given, between one START and one END: for a user
   * action that produces more than one event, e.g. opening the chatbot (its click and its impression).
   */
  raiseEvents(events: ITelemetryEvent[], pageContext = NON_LOGGEDIN_PAGE_CONTEXT) {
    if (!events.length) {
      return
    }
    this.sendWithinSession(pageContext, events.map(event => () => {
      if (event.eid === 'INTERACT') {
        this.interact(event.edata, pageContext)
      } else {
        this.impression(event.edata || {}, pageContext)
      }
    }))
  }

  /** Sends an INTERACT through the library's interact listener. */
  private interact(edata: ITelemetryInteractData, pageContext: WsEvents.ITelemetryPageContext) {
    this.libEvents!.dispatchEvent<WsEvents.IWsEventTelemetryInteract>({
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Info,
      data: {
        edata: { type: edata.type, subType: edata.subtype, id: edata.id },
        object: {},
        pageContext,
        eventSubType: WsEvents.EnumTelemetrySubType.Interact,
      },
      from: '',
      to: 'Telemetry',
      pageContext,
    })
  }

  /**
   * Sends an IMPRESSION. A plain page impression uses the library's `impression()`; the library
   * cannot set `edata.subtype`, so an impression with a subtype is sent with the same context the
   * library uses.
   */
  private impression(edata: ITelemetryImpressionData, pageContext: WsEvents.ITelemetryPageContext) {
    const telemetry = this.telemetry!
    if (!edata.subtype) {
      telemetry.impression({ pageContext, object: {} })
      return
    }
    $t.impression(
      {
        type: 'page',
        subtype: edata.subtype,
        pageid: pageContext.pageId || '',
        uri: window.location.pathname,
      },
      {
        context: {
          pdata: { ...telemetry.pData },
          ...(pageContext.module ? { env: pageContext.module } : null),
        },
        object: {},
      },
    )
  }

  /**
   * Sends events between one START and one END. The SDK uploads its buffer as soon as it
   * receives an END, so the events are sent right away instead of waiting for a full batch.
   */
  private sendWithinSession(pageContext: WsEvents.ITelemetryPageContext, raises: (() => void)[]) {
    if (!this.telemetry) {
      return
    }
    // START/END get the module only: the library would otherwise pass the page id as a content
    // id, which the SDK then keeps as `object.id` on every later event.
    const sessionContext: WsEvents.ITelemetryPageContext = { module: pageContext.module }
    const send = () => {
      const telemetry = this.telemetry!
      telemetry.start(SESSION_EDATA, {}, sessionContext)
      // Each event on its own, so one failing does not drop the others or the END.
      raises.forEach(raise => {
        try {
          raise()
        } catch (e) {
          // tslint:disable-next-line: no-console
          console.log('Error in telemetry event', e)
        }
      })
      telemetry.end(SESSION_EDATA, {}, sessionContext)
    }
    if (this.deviceIdReady) {
      send()
    } else {
      this.pendingEvents.push(send)
    }
  }

  /**
   * Tenant telemetry config posting to the anonymous endpoint on this site's own origin.
   * Cross-origin posts are blocked: the telemetry API's CORS policy does not allow the
   * x-app-id / x-device-id / x-channel-id / dataType headers the SDK always sends.
   */
  private buildTelemetryConfig(): any {
    const tenantConfig = this.initSvc.configDetails && this.initSvc.configDetails.telemetryConfig
    if (!tenantConfig || !tenantConfig.pdata || !tenantConfig.endpoint) {
      return null
    }
    const endpoint = toSitePath(tenantConfig.endpoint)
    return {
      ...tenantConfig,
      // The SDK posts to host + apislug + endpoint, and defaults apislug to '/action' when unset.
      host: '',
      apislug: '',
      endpoint,
      // The library switches to publicEndpoint on some routes; keep it on the same working endpoint.
      publicEndpoint: endpoint,
    }
  }

  /**
   * The library reads the session id from localStorage. Create one per browser session
   * (tracked in sessionStorage) and mirror it there.
   */
  private ensureTelemetrySessionId() {
    let sid = readStorage(() => sessionStorage, TELEMETRY_SESSION_ID_KEY)
    if (!sid) {
      sid = generateUuid()
      writeStorage(() => sessionStorage, TELEMETRY_SESSION_ID_KEY, sid)
    }
    writeStorage(() => localStorage, TELEMETRY_SESSION_ID_KEY, sid)
  }

  /**
   * The SDK builds every event in one shared envelope object. Until it knows the device id it
   * dispatches asynchronously, so a START, event and END raised together would all go out as
   * the last one. Resolve the device id first, and hold events until it is known.
   */
  private resolveDeviceId() {
    setTimeout(() => this.onDeviceIdResolved(generateUuid()), DEVICE_ID_TIMEOUT_MS)
    try {
      $t.getFingerPrint((did: string) => this.onDeviceIdResolved(did))
    } catch (e) {
      // tslint:disable-next-line: no-console
      console.log('Error in telemetry device id', e)
      this.onDeviceIdResolved(generateUuid())
    }
  }

  private onDeviceIdResolved(did: string) {
    if (this.deviceIdReady) {
      return
    }
    this.deviceIdReady = true
    try {
      // The SDK reads this cache when dispatching; with it set, dispatch is synchronous.
      $t.fingerPrintId = did
      if (!$t.isInitialized()) {
        $t.initialize({ ...this.telemetry!.telemetryConfig, did })
      }
    } catch (e) {
      // tslint:disable-next-line: no-console
      console.log('Error in telemetry initialize', e)
    }
    this.pendingEvents.splice(0).forEach(send => send())
  }
}

/** Root-relative path on the current site, e.g. 'api/data/v1/public/telemetry' -> '/api/data/v1/public/telemetry'. */
function toSitePath(path: string): string {
  return `/${path.replace(/^\/+/, '')}`
}

/** Storage access can throw (private mode, blocked site data), so treat any failure as "not stored". */
function readStorage(storage: () => Storage, key: string): string {
  try {
    return storage().getItem(key) || ''
  } catch {
    return ''
  }
}

function writeStorage(storage: () => Storage, key: string, value: string): boolean {
  try {
    storage().setItem(key, value)
    return true
  } catch {
    return false
  }
}

function generateUuid(): string {
  const cryptoApi: Crypto | undefined = typeof crypto !== 'undefined' ? crypto : undefined
  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
    return cryptoApi.randomUUID()
  }
  const bytes = new Uint8Array(16)
  if (cryptoApi && typeof cryptoApi.getRandomValues === 'function') {
    cryptoApi.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256)
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}
