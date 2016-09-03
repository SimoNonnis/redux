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

### Designing the State Shape
- In Redux, all application state is stored as a single object. *It’s a good idea to think of its shape before writing any code*. What’s the minimal representation of your app’s state as an object?
- You’ll often find that you need to store some data, as well as some UI state, in the state tree. This is fine, but try to keep the data separate from the UI state
- In complex apps try to keep your state as normalized as possible, without any nesting
- Think of the app’s state as a database

### Writing a reducer
- The reducer is a pure function that takes the current state and an action, and returns the next state
- Given the same arguments, it should calculate the next state and return it. No surprises. No side effects. No API calls. No mutations. Just a calculation.
- we never write directly to state or its fields, and instead we return new objects (using Object.assign({}, state, {setNewPropertyOfState})
- Just remember to never assign to anything inside the state unless you clone it first

### Splitting Reducers
- Reducer composition it’s the fundamental pattern of building Redux apps.
- The main reducer as a function that calls the reducers managing parts of the state, and combines them into a single object. It also doesn’t need to know the complete initial state anymore. It’s enough that the child reducers return their initial state when given undefined at first
- When the app is larger, we can split the reducers into separate files and keep them completely independent
- Redux provides a utility called combineReducers() for combining reducers (expects an object)

## Store
- Holds the state and takes care of calling your reducer when you dispatch an action









