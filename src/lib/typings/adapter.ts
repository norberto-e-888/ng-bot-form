import {
  BotFormErrorPayload,
  BotFormExtraStepsPayload,
  BotFormFailedInputPayload,
  BotFormFetchOptionsSuccessPayload,
  BotFormFulfillmentSuccessPayload,
  BotFormSuccessfulInputPayload,
  BotFormThereIsANextStepPayload,
  BotFormUserInputPayload,
} from './events';
import { BotFormReducerState, BotFormStep, DTO } from './reducer';

type BotFormAdapterFunction<E, D extends DTO = any, P = any> = (
  event?: E
) => (state: BotFormReducerState<D, P>) => BotFormReducerState<D, P>;

export type BotFormAdapterUpdateArrayUtil = <T = any>(
  arr: T[],
  indexToUpdate: number,
  newElement: T
) => T[];

export type BotFormAdapterUtilFindStepByKey<D extends DTO = any, P = any> = (
  state: BotFormReducerState<D, P>,
  key: keyof DTO
) => {
  step: BotFormStep<D>;
  index: number;
  isLastStep: boolean;
};

export type BotFormAdapterUtilFindActiveStep<D extends DTO = any, P = any> = (
  state: BotFormReducerState<D, P>
) => {
  step: BotFormStep<D>;
  index: number;
  isLastStep: boolean;
};

export type BotFormAdapterUtilAddElementsToArrayAfterIndex = <T = any>(
  arr: T[],
  indexToAddElementsAfter: number,
  newElements: T[]
) => T[];

export type BotFormAdapterAddValidInputToDto = BotFormAdapterFunction<BotFormSuccessfulInputPayload>;
export type BotFormAdapterSetSelectOptions = BotFormAdapterFunction<BotFormFetchOptionsSuccessPayload>;
export type BotFormAdapterInitConversation = BotFormAdapterFunction<undefined>;
export type BotFormAdapterPrompNextMessage = BotFormAdapterFunction<BotFormThereIsANextStepPayload>;
export type BotFormAdapterErrorMessageOnInvalidInput = BotFormAdapterFunction<BotFormFailedInputPayload>;
export type BotFormAdapterErrorMessageOnFetchFailure = BotFormAdapterFunction<BotFormErrorPayload>;
export type BotFormAdapterFulfillmentMessage = BotFormAdapterFunction<BotFormFulfillmentSuccessPayload>;
export type BotFormAdapterUserMessage = BotFormAdapterFunction<BotFormUserInputPayload>;
export type BotFormAdapterAddExtraSteps = BotFormAdapterFunction<BotFormExtraStepsPayload>;
export type BotFormAdapterPassToNextStep = BotFormAdapterFunction<undefined>;
export type BotFormAdapterUndo = BotFormAdapterFunction<undefined>;
export type BotFormAdapter = {
  addErrorMessageOnInvalidInput: BotFormAdapterErrorMessageOnInvalidInput;
  addErrorMessageOnFetchFailure: BotFormAdapterErrorMessageOnFetchFailure;
  addExtraSteps: BotFormAdapterAddExtraSteps;
  addFulfillmentMessage: BotFormAdapterFulfillmentMessage;
  addUserMessage: BotFormAdapterUserMessage;
  addValidInputToDto: BotFormAdapterAddValidInputToDto;
  initConversation: BotFormAdapterInitConversation;
  promptNextStep: BotFormAdapterPrompNextMessage;
  setSelectOptions: BotFormAdapterSetSelectOptions;
  passToNextStep: BotFormAdapterPassToNextStep;
  undo: BotFormAdapterUndo;
};
