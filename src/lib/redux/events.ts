import { createAction, props } from '@ngrx/store';
import {
  BotFormErrorPayload,
  BotFormExtraStepsPayload,
  BotFormFailedInputPayload,
  BotFormFetchOptionsSuccessPayload,
  BotFormFulfillmentSuccessPayload,
  BotFormSuccessfulInputPayload,
  BotFormThereIsANextStepPayload,
  BotFormUserInputPayload,
} from '../typings';

export const botFormEventsFactory = (botName: string) => {
  const userInput = createAction(
    `[${botName}] User Input`,
    props<BotFormUserInputPayload>()
  );

  const successfulUserInput = createAction(
    `[${botName}] Successful User Input`,
    props<BotFormSuccessfulInputPayload>()
  );

  const failedUserInput = createAction(
    `[${botName}] Failed User Input`,
    props<BotFormFailedInputPayload>()
  );

  const lastStepCompleted = createAction(`[${botName}] Last Step Completed`);
  const thereIsANextStep = createAction(
    `[${botName}] There Is A Next Step`,
    props<BotFormThereIsANextStepPayload>()
  );

  const extraStepsConditionMet = createAction(
    `[${botName}] Extra Steps Condition Met`,
    props<BotFormExtraStepsPayload>()
  );

  const extraStepsConditionNotMet = createAction(
    `[${botName}] Extra Steps Condition Not Met`
  );

  const fetchOptionsStart = createAction(`[${botName}] Fetch Options Start`);
  const fetchOptionsSuccess = createAction(
    `[${botName}] Fetch Options Success`,
    props<BotFormFetchOptionsSuccessPayload>()
  );

  const fetchOptionsFailure = createAction(
    `[${botName}] Fetch Options Failure`,
    props<BotFormErrorPayload>()
  );

  const fulfillmentSuccess = createAction(
    `[${botName}] Fulfillment Success`,
    props<BotFormFulfillmentSuccessPayload>()
  );

  const fulfillmentFailure = createAction(
    `[${botName}] Fulfillment Failure`,
    props<BotFormErrorPayload>()
  );

  const conversationInit = createAction(`[${botName}] Conversation Init`);
  const confirmed = createAction(`[${botName}] Form Confirmed`);
  const cancelConfirmation = createAction(`[${botName}] Cancel Confirmation`);
  const undoClicked = createAction(`[${botName}] Undo Clicked`);
  return {
    userInput,
    successfulUserInput,
    failedUserInput,
    lastStepCompleted,
    thereIsANextStep,
    extraStepsConditionMet,
    extraStepsConditionNotMet,
    fetchOptionsStart,
    fetchOptionsSuccess,
    fetchOptionsFailure,
    fulfillmentSuccess,
    fulfillmentFailure,
    conversationInit,
    undoClicked,
    confirmed,
    cancelConfirmation,
  };
};

export type BotFormEvents = ReturnType<
  typeof botFormEventsFactory
>; /* declarando así porque da demasiada pereza anticiparlo en vez de derivarlo */
