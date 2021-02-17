import { HttpErrorResponse } from '@angular/common/http';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import {
  catchError,
  delay,
  filter,
  map,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import {
  BotFormAsyncValidationResponse,
  BotFormSelectOptionsFetcher,
  BotFormReducerState,
  BotFormSuccessfulInputPayload,
} from '../typings';
import { BotFormFulfillment } from '../typings/effects';
import { BotFormEvents } from './events';
import { BotFormSelectors } from './selectors';

export class BotFormEffects {
  constructor(
    protected actions$: Actions,
    protected store: Store,
    protected events: BotFormEvents,
    protected selectors: BotFormSelectors,
    protected fulfillment: BotFormFulfillment
  ) {}

  validateUserInput$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(this.events.userInput),
        withLatestFrom(
          this.store.select(this.selectors.selectActiveStep),
          this.store.select(this.selectors.selectBotFormState)
        ),
        delay(700),
        tap(async ([event, step, state]) => {
          const curatedInput = step.curator
            ? step.curator(event.input)
            : event.input;

          try {
            const schemaValidationResult = step.validationSchema?.validate(
              curatedInput
            );

            const isSchemaValid = !schemaValidationResult?.error;
            const asyncReponse: BotFormAsyncValidationResponse | null =
              step.asyncValidator && isSchemaValid
                ? await step.asyncValidator(curatedInput, state)
                : null;

            if (isSchemaValid && (!asyncReponse || asyncReponse.isValid)) {
              this.store.dispatch(
                this.events.successfulUserInput({
                  input: curatedInput,
                  key: step.key as string,
                })
              );
            } else {
              this.store.dispatch(
                this.events.failedUserInput({
                  input: curatedInput,
                  key: step.key as string,
                  error:
                    schemaValidationResult?.error?.message ||
                    asyncReponse?.error ||
                    'Error',
                })
              );
            }
          } catch (error) {
            this.store.dispatch(
              this.events.failedUserInput({
                input: curatedInput,
                key: step.key as string,
                error:
                  'Ocurrió un problema con nuestros servidores, intenta luego ¡Lo sentimos!',
              })
            );
          }
        })
      ),
    { dispatch: false }
  );

  addExtraSteps$ = createEffect(() =>
    this.actions$.pipe(
      ofType(this.events.successfulUserInput),
      withLatestFrom(this.store.select(this.selectors.selectBotFormState)),
      map(([event, state]) => {
        if (
          state.conditionedSteps?.some((steps) =>
            steps.condition(event as BotFormSuccessfulInputPayload, state)
          )
        ) {
          const [{ steps }] = state.conditionedSteps?.filter(({ condition }) =>
            condition(event as BotFormSuccessfulInputPayload, state)
          );

          return this.events.extraStepsConditionMet({
            steps: steps as any,
            key: event.key as string,
          });
        }

        return this.events.extraStepsConditionNotMet();
      })
    )
  );

  isThereANextStep$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        this.events.extraStepsConditionNotMet,
        this.events.extraStepsConditionMet
      ),
      withLatestFrom(
        this.store.select(this.selectors.selectSteps),
        this.store.select(this.selectors.selectActiveKey),
        this.store.select(this.selectors.selectWasLastStepReached)
      ),
      map(([_, steps, activeKey, wasLastStepReached]) => {
        if (!wasLastStepReached) {
          const activeStepIndex = steps.findIndex(
            (step) => step.key === activeKey
          );

          return this.events.thereIsANextStep({
            key: steps[activeStepIndex + 1].key as string,
          });
        }

        return this.events.lastStepCompleted();
      })
    )
  );

  fetchOptions$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(this.events.thereIsANextStep),
        withLatestFrom(
          this.store.select(this.selectors.selectActiveStep),
          this.store.select(this.selectors.selectBotFormState)
        ),
        filter(([_, step]) => !!step.optionsFetcher),
        tap(async ([_, step, state]) => {
          try {
            this.store.dispatch(this.events.fetchOptionsStart());
            const options = await (step.optionsFetcher as BotFormSelectOptionsFetcher)(
              state as BotFormReducerState<any, any>
            );

            this.store.dispatch(
              this.events.fetchOptionsSuccess({
                options,
                key: step.key as string,
              })
            );
          } catch (error) {
            this.store.dispatch(
              this.events.fetchOptionsFailure({
                error: 'Error de servidor',
              })
            );
          }
        })
      ),
    { dispatch: false }
  );

  runFulfillment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(this.events.confirmed),
      withLatestFrom(this.store.select(this.selectors.selectBotFormState)),
      filter(([_, { isComplete }]) => isComplete),
      switchMap(([_, state]) =>
        this.fulfillment(state).pipe(
          map((fulfillmentPayload) =>
            this.events.fulfillmentSuccess(fulfillmentPayload)
          ),
          catchError((err: HttpErrorResponse) =>
            of(this.events.fulfillmentFailure({ error: err.message }))
          )
        )
      )
    )
  );
}
