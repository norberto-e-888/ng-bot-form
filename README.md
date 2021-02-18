# NgBotForm 🤖

> Formularios con UX de chatbot

## Instalación

Instalamos la librería

```sh
npm install bot-form
```

Instalamos las peer-dependencies

```sh
npm install @ngrx/effects @ngrx/store joi
```

## Ejemplo de uso

1. Definimos la interface del objecto que queremos recopilar del usuario ⬇

```typescript
interface MyBotDto {
  firstName: string;
  lastName: string;
  age: number;
  favoriteColor?: string;
}
```

2. Creamos los pasos base de nuestro form, es decir, aquellos que no están condicionados, aquellos que queremos preguntar siempre

```typescript
...
import { BotFormStep } from 'bot-form'
...

const myBaseSteps: BotFormStep<MyBotDto>[] = [
  {
    key: 'firstName',
    prompt: '¿Cómo te llamas? (nombre de pila)',
    inputType: 'text',
    validationSchema: Joi.string()
      .required()
      .min(3)
      .message('Tu nombre debe tener más de 2 caracteres')
      .trim(),
  },
  {
    key: 'lastName',
    prompt: '¿Cómo te apellidas?',
    inputType: 'text',
    validationSchema: Joi.string()
      .required()
      .min(2)
      .message('Tu apellido debe tener más de 1 caracter')
      .trim(),
  },
  {
    key: 'age',
    prompt: '¿Cuál es tu edad?',
    inputType: 'text',
    validationSchema: Joi.number().min(18).message('¡Debes ser mayor de edad!'),
  },
];
```

_Notarás que no hemos incluido un paso para "favoriteColor", eso es porque solo quiero saber el color favorito de John Lennon 🎶_

3. Creamos los pasos condicionados

```typescript
...
import { BotFormConditionedSteps } from 'bot-form'
...

const myConditionedSteps: BotFormConditionedSteps<MyBotDto>[] = [
  {
    condition: (
      event: BotFormSuccessfulInputPayload<MyBotDto>,
      state: BotFormReducerState<MyBotDto>
    ) => {
      return (
        event.key === 'lastName' &&
        event.input.toLowerCase() === 'lennon' &&
          state.dto.firstName?.toLowerCase() === 'john'
      );
    },
    steps: [
      {
        key: 'favoriteColor',
        prompt:
          "John, my guy, what's yer favorite colour mate?",
        inputType: 'select',
        selectOptions: [
          {
            text: 'Red',
            value: 'red',
          },
          {
            text: 'Azul',
            value: 'blue',
          },
          {
            text: "It depends on Yoko's mood",
            value: '🤐',
          },
        ],
      },
    ],
  },
];
```

_❗ IMPORTANTE: Notar cómo en la condición no hice referencia al DTO para leer al valor de "lastName", sino en vez lo leí del evento. De haber hecho referencia a ambos valores a tráves del DTO hubiera creado una situación donde la condición se va a hacer cierta en el resto de los pasos despúes de "lastName" ya que una vez recopilados "firstName" y "lastName" no han de cambiar (exceptuando el "undo"), así que es importante hacer referencia al evento actual siempre en nuestras condciones para que esta solo se pueda hacerse cierta despúes que el usuario ingrese input para el evento despúes del cuál queremos que los pasos condicionados se agreguen, en este caso queremos que se agreguen despúes del paso "lastName" ❗_

4. Ahora vamos a definir la función que va a ser llamada cuando el evento "confirmed" sea disparado. La función va a tener acceso al estado entero, pero supongamos que solo queremos enviar el dto recopilado como body en una consulta POST. La función debe devolver un observable con la data que queremos tener disponible como payload del evento _fulfillmentSuccess_ y que será guardada en el estado bajo la llave _fulfillmentPayload_ y debe cumplir con la interface ⬇

```typescript
interface BotFormFulfillmentSuccessPayload {
  message: string; // se mostrará como un último mensaje de parte del bot
  data: any;
}
```

```typescript
...
import { BotFormFulfillment, BotFormReducerState } from 'bot-form'
...

const myFulfillment: BotFormFulfillment<MyBotDto> = (
  state: BotFormReducerState<MyBotDto>
) => {
  return fromFetch('http://myApi/some-end-point', {
    method: 'POST',
    body: JSON.stringify(state.dto),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  }).pipe(concatMap((response) => response.json() as BotFormFulfillmentSuccessPayload));
};
```

5. Ya que tenemos el DTO a recolectar, nuestros pasos y nuestra función de _fulfillment_, estamos listos para generar nuestro "redux kit"

**NOTA: en caso de tener múltiples bot-forms es requerido se les den nombres distintos**

```typescript
...
import { getBotFormKit } from 'bot-form'
...

export const myBotFormReduxKit = getBotFormKit<MyBotDto>({
  name: 'MyBot',
  steps: myBaseSteps,
  conditionedSteps: myConditionedSteps,
  welcomeMessage: "Bienvenid@" // propiedad opcional, si es pasada, se mostrará como primer mensaje
});
```

Este objecto tiene el reducer, los selectors y los events de nuestro bot, pero áun falta el "motor" del form-bot

6. El motor de nuestro bot-form es una clase la cuál debemos decorar con @Injectable() y extender _BotFormEffects_. A esta clase le podemos agregar cualquier otro efecto que queramos

**NOTA: en caso de tener múltiples bot-forms necesitamos una clase por bot-form**

```typescript
...
import { BotFormEffects } from 'bot-form'
...

@Injectable()
export class MyBotEffects extends BotFormEffects {
  constructor(readonly actions: Actions, readonly store: Store) {
    super(
      actions,
      store,
      myBotFormReduxKit.events,
      myBotFormReduxKit.selectors,
      myFulfillment
    );
  }
}
```

7. Con @ngrx, registramos el bot-form en el módulo que más apropiado nos parezca, sea con .forFeature o .forRoot

```typescript
...
import { StoreModule } from '@ngrx/store'
import { EffectsModule } from '@ngrx/effects'
...

imports: [
  ...,
  StoreModule.forRoot({
    MyBot: myBotFormReduxKit.reducer,
  }),
  EffectsModule.forRoot([MyBotEffects]),
  ...,
];
```

_❗ IMPORTANTE: La llave del reducer debe ser igual al name que le pasamos a getBotFormKit, es este caso "MyBot"_

_❗ IMPORTANTE: Es posible que tengas que crear la siguiente función (depende de si estas usando Ivy o no) para hacer referencia el reducer en el decorador @NgModule_

```typescript
export function myFormBotReducer(
  state: BotFormReducerState<any, any> | undefined,
  action: Action
) {
  return myBotFormReduxKit.reducer(state, action);
}
```

Tus imports quedarian así

```typescript
imports: [
  ...,
  StoreModule.forRoot({
      MyBot: myBotFormReduxKit.myFormBotReducer,
  }),
  EffectsModule.forRoot([MyBotEffects]),
  ...,
]
```

8. Instalamos @ngrx/store-devtools

```sh
npm install @ngrx/store-devtools
```

```typescript
imports: [
  ...,
  StoreModule.forRoot({
    MyBot: myBotFormReduxKit.reducer,
  }),
  EffectsModule.forRoot([MyBotEffects]),
  StoreDevtoolsModule.instrument({
    maxAge: 30,
    logOnly: environment.production,
    name: 'My App',
  }),
  ...,
];
```

9. Para consumir nuestro bot tenemos que saber que seleccionar del estado y que eventos disparar

```typescript
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { BotFormMessage, BotFormSender, BotFormStep } from 'bot-form';
import { myBotFormKit } from '../donde-sea-que-declaramos-el-kit.ts';

@Component({
  selector: 'app-chatbot',
  templateUrl: './app-chatbot.component.html',
  stylesUrls: ['./app-chatbot.component.scss'],
})
export class ChatbotComponent implements OnInit {
  activeStep$!: Observable<BotFormStep>;
  isComplete$!: Observable<boolean>;
  isLoading$!: Observable<boolean>;
  shouldUserInputBeSupressed$!: Observable<boolean>;
  messages$!: Observable<BotFormMessage[]>;

  constructor(private readonly store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(myBotFormKit.events.conversationInit());
    this.activeStep$ = this.store.select(
      myBotFormKit.selectors.selectActiveStep
    );

    this.isComplete$ = this.store.select(
      myBotFormKit.selectors.selectIsComplete
    );

    this.isLoading$ = this.store.select(myBotFormKit.selectors.selectIsLoading);
    this.shouldUserInputBeSupressed$ = this.store.select(
      myBotFormKit.selectors.selectShouldUserInputBeSupressed
    );

    this.messages = this.store.select(myBotFormKit.selectors.selectMessages);
  }

  handleInput(e: Event): void {
    e.preventDefault();
    this.store.dispatch(
      myBotFormKit.events.userInput({
        input:
          e.target
            .value /*o donde sea que se encuentre la data según el evento sintético del html que elijas usar (quizás necesites una función distinta para los select)*/,
      })
    );
  }

  handleUndoClick(e: Event): void {
    e.preventDefault();
    this.store.dispatch(myBotFormKit.events.undoClicked());
  }

  handleConfirm(e: Event): void {
    e.preventDefault();
    this.store.dispatch(myBotFormKit.events.confirmed());
  }

  handleCancelConfirmation(e: Event): void {
    e.preventDefault();
    this.store.dispatch(myBotFormKit.events.cancelConfirmation());
  }

  isMessageReply(sender: BotFormSender): boolean {
    // función de utilidad para saber de que lado de la conversación mostrar el mensaje
    return sender === BotFormSender.User;
  }
}
```

En el html del component vamos a querer:

- renderizar los mensajes
- mostrar un indicador de carga usando la bandera "isLoading$"
- mostrar un input para texto o un select dependiendo del valor de "activeStep$"
- una manera de disparar "handleInput"
- una manera de disparar "handleUndoClick"
- una manera de disparar "handleConfirm"
- una manera de disparar "handleCancelConfirmation"
- condicionar la renderización el html que puede disparar "handleConfirm" y "handleCancelConfirmation" según la bandera "isComplete$"
- suprimir la capacidad del usuario de ingresar input según el valor de "shouldUserInputBeSupressed$"

**NOTA: Un componente propio de la librería está en desarrollo, mientras tanto espero que el .ts de arriba les de una idea de como consumir el estado del bot-form**

## Extendiendo los efectos

Somos libres de crear efectos extras a los necesarios para el funcionamiento básico del bot-form (los cuales vienen incluidos en _BotFormEffects_)

```typescript
...
@Injectable()
export class MyBotEffects extends BotFormEffects {
  abrirModalDeConfirmacion$ = this.actions$.pipe(
    ofType(myBotFormReduxKit.events.lastStepCompleted),
    tap(() => {
      // Abrir modal
    })
  );

  cerrarModalDeConfirmacion$ = this.actions$.pipe(
    ofType(myBotFormReduxKit.events.cancelConfirmation),
    tap(() => {
      // Cerrar modal
    })
  );

  reaccionarAlExitoDeFulfillment$ = this.actions$.pipe(
    ofType(myBotFormReduxKit.events.fulfillmentSuccess),
    tap((payload) => {
      // Hacer algo con payload.data o payload.message
    })
  );

  constructor(readonly actions: Actions, readonly store: Store) {
    super(
      actions,
      store,
      myBotFormReduxKit.events,
      myBotFormReduxKit.selectors,
      myFulfillment
    );
  }
}
...
```

## Leyendo opciones de una fuente externa

```typescript
...
 {
        key: 'favoriteColor',
        prompt:
          // tslint:disable-next-line: quotemark
          "<secret message for johnny boy> John, my guy, what's yer favorite colour mate?",
        inputType: 'select',
        selectOptions: [],
         optionsFetcher: async (state: BotFormReducerState<MyBotDto>) => {
           // state es el estado entero del bot, puedes leer data de acá para mandarla al servidor y leer las opciones dinámicamente
          const response = await fetch(`http://myApi/get-colors-options/?lastName=${state.dto.lastName}`);
          return response.json() as BotFormSelectInputOption[];
        },
      },
...
```

❗ _Solo te tienes que asegurar que el servidor responda con la forma correcta, es decir, un arreglo de la interface BotFormSelectInputOption y declarar el arreglo selectOptions vacío_

```typescript
interface BotFormSelectInputOption {
  text: string;
  value: BotFormValueType;
}
```

## Validaciones del lado del servidor

La propiedad _asyncValidator_ nos permite correr una función asincróna arbitraria cuyo resultado será interpretado como una validación éxitosa o fallida del paso en cuestión

```typescript
...
  {
    key: 'lastName',
    prompt: '¿Cómo te apellidas?',
    inputType: 'text',
    validationSchema: Joi.string()
      .required()
      .min(2)
      .trim()
      .message('Tu apellido debe tener más de 1 caracter'),
    asyncValidator: async (value, state) => {
      // value es el input que el usuario ingreso para este paso y state es el estado entero
      // mada toda la data relevante a tu servidor para que valide el input
      const response = await fetch(`http://myApi/is-last-name-valid/${value}`);
      return response.json() as BotFormAsyncValidationResponse;
    },
  },
...
```

❗ _Solo te tienes que asegurar que el servidor responda la siguiente interface ⬇_

```typescript
interface BotFormAsyncValidationResponse {
  isValid: boolean;
  error?: string; // mensaje mostrado por el bot
}
```

## Snapshot del estado generado

![alt text](bot-form-state.png 'Title')

## Eventos y seleccionadores disponibles

_pseudo javascript_

```javascript
 reduxKit.events => {
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
  }

reduxKit.selectors => {
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
  }
```

**NOTA: es probable que algunos de los eventos y seleccionadores (especialmente eventos) nunca te incumban directamente, sea en tus extensiones de efectos o en el .ts o .htlm de tu componente**

## Metadata

Autor: Norberto Cáceres – norberto.e.888@outlook.es

Distribuido bajo la licencia MIT

## Contribuir

1. Forkéalo (https://github.com/norberto-e-888/ng-bot-form)
2. Create tu rama de feature (`git checkout -b feature/fooBar`)
3. Commit tus cambios (`git commit -am 'Add some fooBar'`)
4. Empuja a tu rama (`git push origin feature/fooBar`)
5. Crea un pull request
