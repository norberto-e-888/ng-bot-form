import {
  Component,
  Inject,
  InjectionToken,
  Injector,
  Input,
  OnInit,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { BotFormMessage, BotFormSender, BotFormStep } from 'bot-form';
import { Observable } from 'rxjs';
import { BotFormReduxKit } from '../../public-api';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'bot-form-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatbotComponent implements OnInit {
  isComplete$!: Observable<boolean>;
  isLoading$!: Observable<boolean>;
  isFulfilled$!: Observable<boolean>;
  shouldUserInputBeSupressed$!: Observable<boolean>;
  messages$!: Observable<BotFormMessage[]>;
  activeStep$!: Observable<BotFormStep>;
  input = '';
  reduxKit!: BotFormReduxKit;

  @Input()
  reduxKitToken!: InjectionToken<BotFormReduxKit>;

  constructor(
    @Inject(Store)
    private readonly store: Store,
    private readonly injector: Injector
  ) {}

  ngOnInit(): void {
    this.reduxKit = this.injector.get(this.reduxKitToken);
    this.store.dispatch(this.reduxKit.events.conversationInit());
    this.activeStep$ = this.store.select(
      this.reduxKit.selectors.selectActiveStep
    );

    this.isComplete$ = this.store.select(
      this.reduxKit.selectors.selectIsComplete
    );

    this.isLoading$ = this.store.select(
      this.reduxKit.selectors.selectIsLoading
    );

    this.isFulfilled$ = this.store.select(
      this.reduxKit.selectors.selectIsFulfilled
    );

    this.shouldUserInputBeSupressed$ = this.store.select(
      this.reduxKit.selectors.selectShouldUserInputBeSupressed
    );

    this.messages$ = this.store.select(this.reduxKit.selectors.selectMessages);
  }

  handleTextInput(): void {
    this.store.dispatch(this.reduxKit.events.userInput({ input: this.input }));
    this.input = '';
  }

  handleSelectInput({ value }: any): void {
    this.store.dispatch(this.reduxKit.events.userInput({ input: value }));
  }

  handleUndoClick(): void {
    this.store.dispatch(this.reduxKit.events.undoClicked());
    this.input = '';
  }

  handleConfirmClick(): void {
    this.store.dispatch(this.reduxKit.events.confirmed());
  }

  handleCancelConfirmClick(): void {
    this.store.dispatch(this.reduxKit.events.cancelConfirmation());
  }

  isMessageAReply(sender: BotFormSender): boolean {
    return sender === BotFormSender.User;
  }
}
