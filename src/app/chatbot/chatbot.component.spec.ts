import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ChatbotComponent } from './chatbot.component';
import { ChatbotService } from './chatbot.service';
import { CHATBOT_ERROR_MESSAGE } from './chatbot.constants';
import { AppTelemetryService } from '../services/telemetry.service';

describe('ChatbotComponent', () => {
  let fixture: ComponentFixture<ChatbotComponent>
  let component: ChatbotComponent
  let chatbotSvc: { sendMessage: jest.Mock }
  let telemetrySvc: { raiseInteract: jest.Mock, raiseImpression: jest.Mock, raiseEvents: jest.Mock }

  beforeEach(() => {
    chatbotSvc = { sendMessage: jest.fn() }
    telemetrySvc = { raiseInteract: jest.fn(), raiseImpression: jest.fn(), raiseEvents: jest.fn() }
    TestBed.configureTestingModule({
      imports: [ChatbotComponent],
      providers: [
        { provide: ChatbotService, useValue: chatbotSvc },
        { provide: AppTelemetryService, useValue: telemetrySvc },
      ],
    })
    fixture = TestBed.createComponent(ChatbotComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('opens the panel from the launcher and closes it again', () => {
    const host: HTMLElement = fixture.nativeElement
    host.querySelector<HTMLButtonElement>('.floating-chat-btn')!.click()
    fixture.detectChanges()
    expect(component.isOpen).toBe(true)
    expect(host.querySelector('.chatbot-panel')!.classList).toContain('open')
    expect(host.querySelector('.floating-chat-btn')).toBeNull()

    component.close()
    fixture.detectChanges()
    expect(host.querySelector('.chatbot-panel')!.classList).not.toContain('open')
  })

  it('raises the chatbot-open interact and impression together, once per open', () => {
    component.open()
    component.open()

    // One call, so both events share a single START/END pair.
    expect(telemetrySvc.raiseEvents).toHaveBeenCalledTimes(1)
    expect(telemetrySvc.raiseEvents).toHaveBeenCalledWith([
      { eid: 'INTERACT', edata: { type: 'click', subtype: 'Jago', id: 'chatbot-open' } },
      { eid: 'IMPRESSION', edata: { subtype: 'chatbot-open' } },
    ])
    expect(telemetrySvc.raiseInteract).not.toHaveBeenCalled()
    expect(telemetrySvc.raiseImpression).not.toHaveBeenCalled()

    component.close()
    component.open()
    expect(telemetrySvc.raiseEvents).toHaveBeenCalledTimes(2)
  })

  it('raises language-change-existing with the current language when the language menu opens', () => {
    const host: HTMLElement = fixture.nativeElement
    component.open()
    fixture.detectChanges()
    telemetrySvc.raiseInteract.mockClear()

    host.querySelector<HTMLButtonElement>('.lang-pill-btn')!.click()
    fixture.detectChanges()

    expect(component.isLangMenuOpen).toBe(true)
    expect(telemetrySvc.raiseInteract).toHaveBeenCalledTimes(1)
    expect(telemetrySvc.raiseInteract).toHaveBeenCalledWith({
      type: 'click', subtype: 'English', id: 'language-change-existing',
    })

    // Closing the menu with the same button is not a language-change click.
    host.querySelector<HTMLButtonElement>('.lang-pill-btn')!.click()
    expect(component.isLangMenuOpen).toBe(false)
    expect(telemetrySvc.raiseInteract).toHaveBeenCalledTimes(1)
  })

  it('raises language-change-target with the chosen language, by its English name', () => {
    const host: HTMLElement = fixture.nativeElement
    component.open()
    fixture.detectChanges()
    host.querySelector<HTMLButtonElement>('.lang-pill-btn')!.click()
    fixture.detectChanges()
    telemetrySvc.raiseInteract.mockClear()

    // Hindi is labelled in Devanagari; telemetry still gets "Hindi".
    host.querySelectorAll<HTMLButtonElement>('.lang-item')[1].click()
    fixture.detectChanges()

    expect(component.selectedLanguage.code).toBe('hin')
    expect(component.isLangMenuOpen).toBe(false)
    expect(telemetrySvc.raiseInteract).toHaveBeenCalledTimes(1)
    expect(telemetrySvc.raiseInteract).toHaveBeenCalledWith({
      type: 'click', subtype: 'Hindi', id: 'language-change-target',
    })

    // Reopening the menu now reports Hindi as the existing language.
    host.querySelector<HTMLButtonElement>('.lang-pill-btn')!.click()
    expect(telemetrySvc.raiseInteract).toHaveBeenLastCalledWith({
      type: 'click', subtype: 'Hindi', id: 'language-change-existing',
    })
  })

  it('gives every language an English name for telemetry', () => {
    component.languages.forEach(lang => expect(lang.name).toMatch(/^[A-Za-z]+$/))
  })

  it('sends the query with history and language, then types out the formatted answer', fakeAsync(() => {
    chatbotSvc.sendMessage.mockReturnValue(of({ answer: 'Hello **there**\nfriend' }))
    component.selectLanguage(component.languages[1])
    component.inputText = 'Hi'
    component.sendMessage()

    expect(chatbotSvc.sendMessage).toHaveBeenCalledWith('Hi', [{ role: 'user', content: 'Hi' }], 'hin')
    expect(component.showSuggestions).toBe(false)
    expect(component.inputText).toBe('')

    flush()
    const bot = component.messages[1]
    expect(bot.typing).toBe(false)
    expect(bot.html).toBe('Hello <strong>there</strong><br>friend')
  }))

  it('escapes HTML in bot answers', fakeAsync(() => {
    chatbotSvc.sendMessage.mockReturnValue(of({ answer: '<img src=x onerror=alert(1)>' }))
    component.inputText = 'x'
    component.sendMessage()
    flush()
    expect(component.messages[1].html).toBe('&lt;img src=x onerror=alert(1)&gt;')
  }))

  it('shows an error message when the request fails and leaves it out of the history', fakeAsync(() => {
    chatbotSvc.sendMessage.mockReturnValue(throwError(() => new Error('down')))
    jest.spyOn(console, 'error').mockImplementation(() => {})
    component.inputText = 'first'
    component.sendMessage()
    tick()
    expect(component.messages[1]).toEqual(expect.objectContaining({ text: CHATBOT_ERROR_MESSAGE, isError: true }))
    expect(component.isWaiting).toBe(false)

    chatbotSvc.sendMessage.mockReturnValue(of({ answer: 'ok' }))
    component.inputText = 'second'
    component.sendMessage()
    expect(chatbotSvc.sendMessage).toHaveBeenLastCalledWith('second', [
      { role: 'user', content: 'first' },
      { role: 'user', content: 'second' },
    ], 'eng')
    flush()
  }))

  it('ignores empty input and sends while a reply is pending', () => {
    component.inputText = '   '
    component.sendMessage()
    expect(chatbotSvc.sendMessage).not.toHaveBeenCalled()

    chatbotSvc.sendMessage.mockReturnValue(of())
    component.inputText = 'one'
    component.sendMessage()
    component.inputText = 'two'
    component.sendMessage()
    expect(chatbotSvc.sendMessage).toHaveBeenCalledTimes(1)
  })

  it('allows only one feedback choice per message', () => {
    const message: any = { sender: 'bot', text: 'a' }
    component.setFeedback(message, 'up')
    component.setFeedback(message, 'down')
    expect(message.feedback).toBe('up')
  })
})
