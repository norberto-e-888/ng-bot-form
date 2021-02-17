import { BotFormSender } from '../typings';
import {
  BotFormAdapter,
  BotFormAdapterUpdateArrayUtil,
  BotFormAdapterUtilAddElementsToArrayAfterIndex,
  BotFormAdapterUtilFindStepByKey,
  BotFormStep,
  BotFormAdapterUtilFindActiveStep,
  BotFormMessage,
} from '../typings';

export const botFormAdapterFactory = (): BotFormAdapter => {
  // tslint:disable-next-line: variable-name
  const _updateArray: BotFormAdapterUpdateArrayUtil = (
    arr,
    indexToUpdate,
    newElement
  ) => [
    ...arr.slice(0, indexToUpdate),
    newElement,
    ...arr.slice(indexToUpdate + 1),
  ];

  // tslint:disable-next-line: variable-name
  const _findStep: BotFormAdapterUtilFindStepByKey = (state, key) => {
    const index = state.steps.findIndex((s) => key === s.key);
    const step = state.steps[index] as BotFormStep;
    const isLastStep = index === state.steps.length - 1;
    return {
      index,
      step,
      isLastStep,
    };
  };

  // tslint:disable-next-line: variable-name
  const _findActiveStep: BotFormAdapterUtilFindActiveStep = (state) =>
    _findStep(state, state.activeKey as string);

  // tslint:disable-next-line: variable-name
  const _addElementsToArrayAfterIndex: BotFormAdapterUtilAddElementsToArrayAfterIndex = (
    arr,
    index,
    elements
  ) => [...arr.slice(0, index + 1), ...elements, ...arr.slice(index + 1)];

  return {
    addErrorMessageOnInvalidInput: (event) => (state) => ({
      ...state,
      isValidatingInput: false,
      isPassingToNextStep: false,
      messages: [
        ...state.messages,
        {
          sender: BotFormSender.Bot,
          text: event?.error as string,
          key: event?.key as string,
        },
      ],
    }),
    addErrorMessageOnFetchFailure: (event) => (state) => ({
      ...state,
      isFetchingOptions: false,
      messages: [
        ...state.messages,
        {
          sender: BotFormSender.Bot,
          text: event?.error as string,
          key: state.activeKey as string,
        },
      ],
    }),
    addExtraSteps: (event) => (state) => {
      const { index } = _findStep(state, event?.key as string);
      const updatedSteps: BotFormStep[] = _addElementsToArrayAfterIndex(
        state.steps,
        index,
        event?.steps as BotFormStep[]
      );

      return {
        ...state,
        steps: updatedSteps,
        isComplete: false,
      };
    },
    addFulfillmentMessage: (event) => (state) => ({
      ...state,
      fulfillmentPayload: event?.data,
      isFulfilling: false,
      isFulfilled: true,
      messages: [
        ...state.messages,
        {
          sender: BotFormSender.Bot,
          text: event?.message as string,
          key: 'fulfillmentSuccess',
        },
      ],
    }),
    addUserMessage: (event) => (state) => {
      const { step } = _findActiveStep(state);
      let text = `${event?.input}`; // truco para cast number a string;
      if (step.inputType === 'select' && step.selectOptions) {
        text = step.selectOptions.find(({ value }) => event?.input === value)
          ?.text as string;
      }

      return {
        ...state,
        isValidatingInput: true,
        isPassingToNextStep: true,
        messages: [
          ...state.messages,
          {
            sender: BotFormSender.User,
            text,
            key: state.activeKey as string,
          },
        ],
      };
    },
    addValidInputToDto: (event) => (state) => ({
      ...state,
      dto: {
        ...state.dto,
        [event?.key as string]: event?.input,
      },
      isValidatingInput: false,
    }),
    initConversation: () => (state) => {
      const messages: BotFormMessage[] = [
        {
          sender: BotFormSender.Bot,
          key: state.steps[0].key as string,
          text: state.steps[0].prompt,
        },
      ];

      if (state.welcomeMessage) {
        messages.unshift({
          sender: BotFormSender.Bot,
          key: 'welcome',
          text: state.welcomeMessage,
        });
      }

      return {
        ...state,
        messages,
      };
    },
    promptNextStep: (event) => (state) => {
      const {
        step: { prompt, key },
      } = _findStep(state, event?.key as string);

      return {
        ...state,
        isPassingToNextStep: false,
        activeKey: key as string,
        messages: [
          ...state.messages,
          {
            sender: BotFormSender.Bot,
            text: prompt,
            key: event?.key as string,
          },
        ],
      };
    },
    setSelectOptions: (event) => (state) => {
      const { step, index } = _findStep(state, event?.key as string);
      const newStep: BotFormStep = {
        ...step,
        selectOptions: event?.options,
      };

      const updatedSteps = _updateArray(state.steps, index, newStep);
      return {
        ...state,
        steps: updatedSteps,
        isFetchingOptions: false,
      };
    },
    passToNextStep: () => (state) => {
      const { index } = _findStep(state, state.activeKey as string);
      const nextStep = state.steps[index + 1];
      if (nextStep) {
        return {
          ...state,
          activeKey: nextStep.key as string,
        };
      }

      return {
        ...state,
        isComplete: true,
      };
    },
    undo: () => (state) => {
      const { activeKey, steps, messages, dto, isComplete } = state;
      let previousKey = activeKey;
      const { index: activeStepIndex } = _findStep(state, activeKey as string);
      if (activeStepIndex > 0) {
        previousKey = isComplete
          ? activeKey
          : (steps[activeStepIndex - 1].key as string);
      }

      const indexOfTheFirstMessageOfThePreviousKey = messages.findIndex(
        ({ key }) => key === previousKey
      );

      const startingIndex =
        indexOfTheFirstMessageOfThePreviousKey === 0 && state.welcomeMessage
          ? 1
          : 0; // prevents the first prompt from being removed when there is a welcomeMessage

      const updatedMessages: BotFormMessage[] = messages.slice(
        startingIndex,
        indexOfTheFirstMessageOfThePreviousKey + 1
      );

      const updatedDto = {
        ...dto,
        [previousKey]: undefined,
      };

      const conditionedStepsToWhichActiveKeyIsFirstPositionOf = state.conditionedSteps?.find(
        (conditionedSteps) =>
          conditionedSteps.steps.findIndex(({ key }) => key === activeKey) === 0
      );

      let updatedSteps = steps;
      if (conditionedStepsToWhichActiveKeyIsFirstPositionOf) {
        updatedSteps = [
          ...steps.slice(0, activeStepIndex),
          ...steps.slice(
            activeStepIndex +
              conditionedStepsToWhichActiveKeyIsFirstPositionOf.steps.length
          ),
        ];
      }

      return {
        ...state,
        activeKey: previousKey,
        messages: updatedMessages,
        dto: updatedDto,
        steps: updatedSteps,
        isComplete: false,
        isFulfilling: false,
        isConfirmed: false,
      };
    },
  };
};
