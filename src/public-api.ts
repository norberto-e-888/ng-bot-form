import {
  BotFormConditionedSteps,
  BotFormReducerState,
  BotFormStep,
  DTO,
} from './lib/typings';

import { botFormAdapterFactory } from './lib/redux/adapter';
import { botFormReducerFactory } from './lib/redux/reducer';
import { botFormSelectorsFactory } from './lib/redux/selectors';
import { botFormEventsFactory } from './lib/redux/events';
export { BotFormEffects } from './lib/redux/effects';
export { BotFormModule } from './lib/bot-form.module';
export * from './lib/typings';

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

export interface GetBotFormKitArguments<D extends DTO = any> {
  name: string;
  steps: BotFormStep<D>[];
  conditionedSteps: BotFormConditionedSteps<D>[];
  welcomeMessage?: string;
}

export type BotFormReduxKit = ReturnType<typeof getBotFormKit>;
