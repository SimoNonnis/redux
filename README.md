# Redux

## Core Ideas
- The state of your whole application is stored in an object tree within a single store
- The only way to change the state is to emit an action, an object describing what happened
- State tree is transformed by pure reducers with current state and action as inputs
- Consider state as immutable. New state needs to be a new object

## Actions
- Actions are plain JavaScript objects
- Actions are payloads of information that send data from your application to your store. They are the only source of information for the store. You send them to the store using store.dispatch()
- Only a *type* property is required indicating the type of action been performed. Type value should typically be defined as string constants. Once your app is large enough, you may want to move them into a separate module
- It’s a good idea to pass as little data in each action as possible

### Action Creators
- Functions that return actions
- Action creators can also be asynchronous and have side-effects. *Redux Thunk middleware* is the standard way to manage async control flow with redux
- Pass the result of the action creator to dispatch() function

## Reducers

- You need reducers to specify how the state updates when you dispatch actions
- Actions describe what happened, but don’t specify how the application’s state changes in response. This is the job of a reducer.
