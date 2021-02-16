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
export * from './lib/typings';

export const getBotFormKit = <D extends DTO, P>({
  botName,
  steps,
  conditionedSteps,
}: GetBotFormKitArguments<D>) => {
  if (!steps.length) {
    throw Error('[Bot Form "getBotFormKit"] Steps must have at least 1 entry!');
  }

  const adapter = botFormAdapterFactory();
  const events = botFormEventsFactory(botName);
  const selectors = botFormSelectorsFactory(botName);
  const state: BotFormReducerState<D, P> = {
    activeKey: steps[0].key,
    steps,
    conditionedSteps,
    messages: [],
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

interface GetBotFormKitArguments<D extends DTO> {
  botName: string;
  steps: BotFormStep<D>[];
  conditionedSteps: BotFormConditionedSteps<D>[];
}
