import {
  BotFormConditionedSteps,
  BotFormReducerState,
  BotFormStep,
  DTO,
} from '../typings';
import { botFormAdapterFactory } from './adapter';
import { botFormEventsFactory } from './events';
import { botFormReducerFactory } from './reducer';
import { botFormSelectorsFactory } from './selectors';

export const getBotFormKit = <D extends DTO, P = any>({
  name,
  steps,
  conditionedSteps,
  welcomeMessage,
}: GetBotFormKitArguments<D>) => {
  if (!steps.length) {
    throw Error('[Bot Form "getBotFormKit"] Steps must have at least 1 entry!');
  }

  const adapter = botFormAdapterFactory();
  const events = botFormEventsFactory(name);
  const selectors = botFormSelectorsFactory(name);
  const state: BotFormReducerState<D, P> = {
    activeKey: steps[0].key,
    steps,
    conditionedSteps,
    messages: [],
    welcomeMessage,
    dto: {},
    isComplete: false,
    isFulfilled: false,
    isFetchingOptions: false,
    isFulfilling: false,
    isValidatingInput: false,
    isPassingToNextStep: false,
    isConfirmed: false,
  };

  const reducer = botFormReducerFactory(state, events, adapter);
  return {
    events,
    selectors,
    reducer,
  };
};

export { BotFormEffects } from './effects';
export interface GetBotFormKitArguments<D extends DTO = any> {
  name: string;
  steps: BotFormStep<D>[];
  conditionedSteps: BotFormConditionedSteps<D>[];
  welcomeMessage?: string;
}
