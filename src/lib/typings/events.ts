import {
  BotFormSelectInputOption,
  BotFormStep,
  BotFormValueType,
  DTO,
} from './reducer';

export interface BotFormSuccessfulInputPayload<D extends DTO = any> {
  key: keyof D;
  input: BotFormValueType;
}

export interface BotFormFailedInputPayload
  extends BotFormSuccessfulInputPayload {
  error: string;
}

export interface BotFormUserInputPayload {
  input: BotFormValueType;
}

export interface BotFormThereIsANextStepPayload {
  key: string;
}

export interface BotFormFetchOptionsSuccessPayload {
  key: string;
  options: BotFormSelectInputOption[];
}

export interface BotFormFulfillmentSuccessPayload {
  message: string;
  data: any;
}

export interface BotFormExtraStepsPayload {
  steps: BotFormStep[];
  key: string;
}

export interface BotFormErrorPayload {
  error: string;
}
