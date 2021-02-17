import { Schema } from 'joi';
import { BotFormSuccessfulInputPayload } from './events';

export interface DTO {
  [key: string]: any;
}

export interface BotFormReducerState<D extends DTO, P> {
  activeKey: keyof D;
  steps: BotFormStep<D>[];
  conditionedSteps?: BotFormConditionedSteps<D, P>[];
  messages: BotFormMessage[];
  welcomeMessage?: string;
  dto: Partial<D>;
  fulfillmentPayload?: P;
  isComplete: boolean;
  isFulfilled: boolean;
  isFetchingOptions: boolean;
  isFulfilling: boolean;
  isValidatingInput: boolean;
  isPassingToNextStep: boolean;
  isConfirmed: boolean;
}

export type BotFormInputType = 'select' | 'text';
export type BotFormValueType = string;
export interface BotFormStep<D = any> {
  key: keyof D;
  prompt: string;
  inputType: BotFormInputType;
  selectOptions?: BotFormSelectInputOption[];
  validationSchema?: Schema<BotFormValueType>;
  curator?: BotFormCurator;
  asyncValidator?: BotFormAsyncValidator<D>;
  optionsFetcher?: BotFormSelectOptionsFetcher;
}

export type BotFormCurator = (value: string) => string;
export type BotFormAsyncValidator<D extends DTO = any, P = any> = (
  value: any,
  state: BotFormReducerState<D, P>
) => Promise<BotFormAsyncValidationResponse>;

export type BotFormSelectOptionsFetcher = <D extends DTO = any, P = any>(
  state: BotFormReducerState<D, P>
) => Promise<BotFormSelectInputOption[]>;

export interface BotFormAsyncValidationResponse {
  isValid: boolean;
  error?: string;
}

export interface BotFormSelectInputOption {
  text: string;
  value: BotFormValueType;
}

export enum BotFormSender {
  Bot = 'bot',
  User = 'user',
}

export interface BotFormMessage<D extends DTO = any> {
  text: string;
  key: keyof D | 'welcome' | 'fulfillmentSuccess';
  sender: BotFormSender;
}

export interface BotFormConditionedSteps<D extends DTO = any, P = any> {
  condition: (
    input: BotFormSuccessfulInputPayload<D>,
    state: BotFormReducerState<D, P>
  ) => boolean;
  steps: BotFormStep<D>[];
}
