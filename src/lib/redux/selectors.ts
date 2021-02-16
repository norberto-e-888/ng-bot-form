import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  BotFormMessage,
  BotFormReducerState,
  BotFormStep,
  DTO,
} from '../typings';

export const botFormSelectorsFactory = <D extends DTO, P>(
  botFormReducerKey: string
) => {
  const selectBotFormState = createFeatureSelector<BotFormReducerState<D, P>>(
    botFormReducerKey
  );

  const selectActiveKey = createSelector<
    any,
    BotFormReducerState<D, P>,
    string
  >(selectBotFormState, ({ activeKey }) => activeKey as string);

  const selectIsFetchingOptions = createSelector<
    any,
    BotFormReducerState<D, P>,
    boolean
  >(selectBotFormState, ({ isFetchingOptions }) => isFetchingOptions);

  const selectSteps = createSelector<
    any,
    BotFormReducerState<D, P>,
    BotFormStep[]
  >(selectBotFormState, ({ steps }) => steps);

  const selectShouldUserInputBeSupressed = createSelector<
    any,
    BotFormReducerState<D, P>,
    boolean
  >(
    selectBotFormState,
    ({
      isFetchingOptions,
      isPassingToNextStep,
      isValidatingInput,
      isFulfilling,
      isComplete,
    }) =>
      isFetchingOptions ||
      isPassingToNextStep ||
      isValidatingInput ||
      isFulfilling ||
      isComplete
  );

  const selectMessages = createSelector<
    any,
    BotFormReducerState<D, P>,
    BotFormMessage[]
  >(selectBotFormState, ({ messages }) => messages);

  const selectIsComplete = createSelector<
    any,
    BotFormReducerState<D, P>,
    boolean
  >(selectBotFormState, ({ isComplete }) => isComplete);

  const selectIsFulfilling = createSelector<
    any,
    BotFormReducerState<D, P>,
    boolean
  >(selectBotFormState, ({ isFulfilling }) => isFulfilling);

  const selectIsLoading = createSelector<
    any,
    BotFormReducerState<D, P>,
    boolean
  >(
    selectBotFormState,
    ({ isFulfilling, isValidatingInput, isFetchingOptions }) =>
      isFulfilling || isValidatingInput || isFetchingOptions
  );

  const selectActiveStep = createSelector<
    any,
    BotFormReducerState<D, P>,
    BotFormStep
  >(
    selectBotFormState,
    ({ steps, activeKey }) =>
      steps.find((step) => step.key === activeKey) as BotFormStep
  );

  const selectStepsUpToCurrent = createSelector<
    any,
    BotFormReducerState<D, P>,
    BotFormStep[]
  >(selectBotFormState, ({ steps, activeKey }) => {
    const activeStepIndex = steps.findIndex((step) => step.key === activeKey);
    return steps.slice(0, activeStepIndex + 1);
  });

  const selectWasLastStepReached = createSelector<
    any,
    BotFormReducerState<D, P>,
    boolean
  >(selectBotFormState, ({ activeKey, steps }) => {
    const activeStepIndex = steps.findIndex((step) => step.key === activeKey);

    const isLastStep = activeStepIndex === steps.length - 1;
    return isLastStep;
  });

  const selectStepsDto = createSelector<any, BotFormReducerState<D, P>, any>(
    selectBotFormState,
    ({ dto }) => dto
  );

  return {
    selectBotFormState,
    selectSteps,
    selectActiveKey,
    selectActiveStep,
    selectStepsUpToCurrent,
    selectWasLastStepReached,
    selectIsComplete,
    selectIsFetchingOptions,
    selectStepsDto,
    selectIsFulfilling,
    selectMessages,
    selectIsLoading,
    selectShouldUserInputBeSupressed,
  };
};

export type BotFormSelectors = ReturnType<
  typeof botFormSelectorsFactory
>; /* declarando así porque da demasiada pereza anticiparlo en vez de derivarlo */
