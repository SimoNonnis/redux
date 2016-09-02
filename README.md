# Redux

## Core Ideas
- The state of your whole application is stored in an object tree within a single store
- The only way to change the state is to emit an action, an object describing what happened
- State tree is transformed by pure reducers with current state and action as inputs
- Consider state as immutable. New state needs to be a new object

## Actions
- Actions are plain JavaScript objects
- Actions are payloads of information that send data from your application to your store. They are the only source of information for the store. You send them to the store using store.dispatch().
- Only a *type* property is required indicating the type of action been performed. Type value should typically be defined as string constants. Once your app is large enough, you may want to move them into a separate module.
