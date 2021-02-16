# NgBotForm 🤖

> Formularios con UX de chatbot

<!-- ![](header.png) -->

## Instalación

Instalamos la librería

```sh
npm install bot-form
```

Instalamos los peer-dependencies

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
const myBaseSteps: BotFormStep<MyBotDto>[] = [
  {
    key: "firstName",
    prompt: "¿Cómo te llamas? (nombre de pila)",
    inputType: "text",
    validationSchema: Joi.string()
      .required()
      .min(3)
      .trim()
      .message("Tu nombre debe tener más de 2 caracteres"),
  },
  {
    key: "lastName",
    prompt: "¿Cómo te apellidas?",
    inputType: "text",
    validationSchema: Joi.string()
      .required()
      .min(2)
      .trim()
      .message("Tu apellido debe tener más de 1 caracter"),
  },
  {
    key: "age",
    prompt: "¿Cuál es tu edad?",
    inputType: "text",
    validationSchema: Joi.number().min(18).message("¡Debes ser mayor de edad!"),
  },
];
```

_Notarás que no hemos incluido un paso para "favoriteColor", eso es porque solo quiero saber el color favorito de John Lennon 🎶_

3. Creamos los pasos condicionados

```typescript
const myConditionedSteps: BotFormConditionedSteps<MyBotDto>[] = [
  {
    condition: (
      event: BotFormSuccessfulInputPayload<MyBotDto>,
      state: BotFormReducerState<MyBotDto>
    ) => {
      return (
        event.key === "lastName" &&
        event.input.toLowerCase() === "lennon" &&
        state.dto.firstName.toLowerCase() === "john"
      );
    },
    steps: [
      {
        key: "favoriteColor",
        prompt:
          "<secret message for johnny boy> John, my guy, what's yer favorite colour mate?",
        inputType: "select",
        selectOptions: [
          {
            text: "Red",
            value: "red",
          },
          {
            text: "Azul",
            value: "blue",
          },
          {
            text: "It depends on Yoko's mood",
            value: "🤐",
          },
        ],
      },
    ],
  },
];
```

_❗ IMPORTANTE: Notar cómo en la condición no hice referencia al DTO para leer al valor de "lastName", sino en vez lo leí del evento. De haber hecho referencia a ambos valores a tráves del DTO hubiera creado una situación donde la condición se va a hacer cierta en el resto de los pasos despúes de "lastName" ya que una vez recopilados "firstName" y "lastName" no han de cambiar (exceptuando el "undo"), así que es importante hacer referencia al evento actual siempre en nuestras condciones para que esta solo se pueda hacer cierta despúes de que el usuario de su input para el evento despúes del cuál queremos que los pasos condicionados se agreguen ❗_

4. Ahora vamos a definir la función que va a ser llamada cuando el evento "confirmed" sea disparado. La función va a tener acceso al estado entero, pero supongamos que solo queremos enviar el dto recopilado como body en una consulta POST. La función debe devolver un observable con la data que queremos que sea guardada en el estado como el _fulfillmentPayload_

```typescript
const myFulfillment: BotFormFulfillment<MyBotDto> = (
  state: BotFormReducerState<MyBotDto>
) => {
  return fromFetch("http://myApi/some-end-point", {
    method: "POST",
    body: JSON.stringify(state.dto),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  }).pipe(concatMap((response) => response.json()));
};
```

5. Ya que tenemos el DTO a recolectar, nuestros pasos y nuestra función de _fulfillment_, estamos listos para generar nuestro "redux kit"

**NOTA: en caso de tener múltiples bot-forms es requerido se les den nombres distintos**

```typescript
const myBotFormReduxKit = getBotFormKit<MyBotDto>({
  botName: "MyBot",
  steps: myBaseSteps,
  conditionedSteps: myConditionedSteps,
});
```

Este objecto tiene el reducer, los selectors y los events de nuestro bot, pero áun falta el "motor" del form-bot

6. El motor de nuestro bot-form es una clase la cuál debemos decorar con @Injectable() y extender _BotFormEffects_. A esta clase le podemos agregar cualquier otro efecto que queramos

**NOTA: en caso de tener múltiples bot-forms necesitamos una clase por bot-form**

```typescript
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
imports: [
  StoreModule.forRoot({
    MyBot: myBotFormReduxKit.reducer,
  }),
  EffectsModule.forRoot([MyBotEffects]),
];
```

_❗ IMPORTANTE: La llave del reducer debe ser igual al botName que le pasamos a getBotFormKit, es este caso "MyBot"❗_

8. Instalamos @ngrx/store-devtools

```sh
npm install @ngrx/store-devtools
```

```typescript
imports: [
  StoreDevtoolsModule.instrument({
    maxAge: 30,
    logOnly: environment.production,
    name: "My App",
  }),
];
```

9. TO-DO: En la próxima parte explicaremos como usar los selectors y events desde el componente de chat para consumir el estado y motor que hemos creado

## Metadata

Autor: Norberto Cáceres – norberto.e.888@outlook.es

Distribuido bajo la licencia MIT

## Contribuir

1. Forkéalo (<https://github.com/yourname/yourproject/fork>) TO-DO: Crear repo en GitHub
2. Create tu rama de feature (`git checkout -b feature/fooBar`)
3. Commit tus cambios (`git commit -am 'Add some fooBar'`)
4. Empuja a tu rama (`git push origin feature/fooBar`)
5. Crea un pull request
