import { createReducer, on } from '@ngrx/store';
import { BotFormAdapter, BotFormReducerState, DTO } from '../typings';
import { BotFormEvents } from './events';

export const botFormReducerFactory = (
  INITIAL_STATE: BotFormReducerState<any, any>,
  EVENTS: BotFormEvents,
  ADAPTER: BotFormAdapter
) =>
  createReducer(
    INITIAL_STATE,
    on(EVENTS.conversationInit, (state) => ADAPTER.initConversation()(state)),
    on(EVENTS.userInput, (state, event) =>
      ADAPTER.addUserMessage(event)(state)
    ),
    on(EVENTS.successfulUserInput, (state, event) =>
      ADAPTER.addValidInputToDto(event)(state)
    ),
    on(EVENTS.failedUserInput, (state, event) =>
      ADAPTER.addErrorMessageOnInvalidInput(event)(state)
    ),
    on(EVENTS.thereIsANextStep, (state, event) =>
      ADAPTER.promptNextStep(event)(state)
    ),
    on(EVENTS.extraStepsConditionMet, (state, event) =>
      ADAPTER.addExtraSteps(event)(state)
    ),
    on(EVENTS.fetchOptionsStart, (state) => ({
      ...state,
      isFetchingOptions: true,
    })),
    on(EVENTS.fetchOptionsSuccess, (state, event) =>
      ADAPTER.setSelectOptions(event)(state)
    ),
    on(EVENTS.lastStepCompleted, (state) => ({
      ...state,
      isComplete: true,
      isPassingToNextStep: false,
    })),
    on(EVENTS.fetchOptionsFailure, (state, event) =>
      ADAPTER.addErrorMessageOnFetchFailure(event)(state)
    ),
    on(EVENTS.undoClicked, (state) => ADAPTER.undo()(state)),
    on(EVENTS.confirmed, (state) => ({
      ...state,
      isConfirmed: true,
      isFulfilling: true,
    })),
    on(EVENTS.cancelConfirmation, (state) => ADAPTER.undo()(state)),
    on(EVENTS.fulfillmentSuccess, (state, event) =>
      ADAPTER.addFulfillmentMessage(event)(state)
    ),
    on(EVENTS.fulfillmentFailure, (state) => ADAPTER.undo()(state))
  );
