# Redux

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
- Actions describe what happened, but don’t specify how the application’s state changes in response. This is the job of a reducer

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
- Is the object that brings together actions and reducers
- Holds application state and allow access to it via getState()
- Allows state to be updated via dispatch(action)
- Registers listeners via subscribe(listener)

## Data Flow
Redux architecture revolves around a strict unidirectional data flow:
  1.  You call *store.dispatch(action)* Think of an action as a very brief snippet of news. “Mary liked article 42.” or “‘Read the Redux docs.’ was added to the list of todos.”
  2.  The Redux store calls the reducer function you gave it. The store will pass two arguments to the reducer: the current state tree and the action
  3.  The root reducer may combine the output of multiple reducers into a single state tree. Redux ships with a *combineReducers()* helper function, useful for “splitting” the root reducer into separate functions that each manage one branch of the state tree
  4.  The Redux store saves the complete state tree returned by the root reducer. This new tree is now the next state of your app! Every listener registered with store.subscribe(listener) will now be invoked; listeners may call store.getState() to get the current state.

## Usage with React
- You need react-redux that provides <Provider store/>, connect([mapStateToProps], [mapDispatchToProps], [mergeProps], [options])

### Presentational and Container Components
- React bindings for Redux embrace the idea of separating presentational and container components
- If you migrate from Redux to something else, you'll be able to keep presentational components exactly the same. They have no dependency on Redux
- You write presentational components and react-redux will generate the container components using *connect()*
- We will need some container components to connect the presentational components to Redux
- Sometimes it's hard to tell if some component should be a presentational component or a container
- It's fine to mix presentation and logic in a component that is very small. As it grows, it will be more obvious how to split it

### Passing the Store
- All container components need access to the Redux store so they can subscribe to it. One option would be to pass it as a prop to every container component. However it gets tedious, as you have to wire store even through presentational components just because they happen to render a container deep in the component tree
- The option is to use a special React Redux component called <Provider> to make the store available to all container components in the application without passing it explicitly
- You only need to use it once when you render the root component
- *<Provider store>* Makes the Redux store available to the connect() calls in the component hierarchy below. Normally, you can’t use connect() without wrapping the root component in <Provider>
- *connect([mapStateToProps], [mapDispatchToProps], [mergeProps], [options])* Connects a React component to a Redux store

## Async Actions
When you call an asynchronous API, there are two crucial moments in time: the moment you start the call, and the moment when you receive an answer (or a timeout).

Each of these two moments usually require a change in the application state; to do that, you need to dispatch normal actions that will be processed by reducers synchronously. Usually, for any API request you'll want to dispatch at least three different kinds of actions:

1. *An action informing the reducers that the request began*. The reducers may handle this action by toggling an isFetching flag in the state. This way the UI knows it's time to show a spinner
2. *An action informing the reducers that the request finished successfully.* The reducers may handle this action by merging the new data into the state they manage and resetting isFetching. The UI would hide the spinner, and display the fetched data
3. *An action informing the reducers that the request failed.* The reducers may handle this action by resetting isFetching. Additionally, some reducers may want to store the error message so the UI can display it

- For dealing with async requests we'll need redux-thunk. Using redux thunk middleware an action creator is able to return a function instead of a plain action object
- When an action creator returns a function, that function will get executed by the Redux Thunk middleware 
- This function doesn't need to be pure; it is thus allowed to have side effects, including executing asynchronous API calls
- Use fetch() and in every file you use it *import fetch from 'isomorphic-fetch'* Internally, it uses whatwg-fetch polyfill on the client, and node-fetch on the server, so you won't need to change API calls if you change your app to be universal
- Be aware that any fetch polyfill assumes a Promise polyfill is already present. The easiest way to ensure you have a Promise polyfill is to enable Babel's ES6 polyfill in your entry point before any other code runs
- Do this once before any other code in your app *import 'babel-polyfill'*

### Async Flow
- Without middleware, Redux store only supports synchronous data flow. This is what you get by default with createStore()
- You may enhance createStore() with applyMiddleware()
- When the last middleware in the chain dispatches an action, it has to be a plain object. This is when the synchronous Redux data flow takes place.

## Usage with React Router
- So you want to do routing with your Redux app. You can use it with React Router. Redux will be the source of truth for your data and React Router will be the source of truth for your URL

## Using Object Spread Operator
- Since one of the core tenets of Redux is to never mutate state, you'll often find yourself using Object.assign() to create copies of objects with new or updated values
- While effective, using Object.assign() can quickly make simple reducers difficult to read given its rather verbose syntax
- An alternative approach is to use the object spread syntax proposed for the next versions of JavaScript which lets you use the spread (...) operator to copy enumerable properties from one object to another in a more succinct way. The object spread operator is conceptually similar to the ES6 array spread operator
- You can use your existing es2015 preset, install babel-plugin-transform-object-rest-spread and add it individually to the plugins array in your .babelrc

## Reducing Boilerplate
- Redux is in part inspired by Flux, and the most common complaint about Flux is how it makes you write a lot of boilerplate
- Redux lets us choose how verbose we'd like our code to be, depending on personal style, team preferences, longer term maintainability, and so on
- You can define action type as a string constant *const ADD_TODO = 'ADD_TODO'*
- Why is this beneficial? It is often claimed that constants are unnecessary, and for small projects, this might be correct. For larger projects, there are some benefits to defining action types as constants:
  - It helps keep the naming consistent because all action types are gathered in a single place
  - Sometimes you want to see all existing actions before working on a new feature. It may be that the action you need was already added by somebody on the team, but you didn't know
  - The list of action types that were added, removed, and changed in a Pull Request helps everyone on the team keep track of scope and implementation of new features
  - If you make a typo when importing an action constant, you will get undefined. Redux will immediately throw when dispatching such an action, and you'll find the mistake sooner
- It is up to you to choose the conventions for your project. You may start by using inline strings, and later transition to constants, and maybe later group them into a single file. Redux does not have any opinion here, so use your best judgment
- We don't have to worry about looking at each place where todos are being added, to make sure they have this check. Action creators let you decouple additional logic around dispatching an action, from the actual components emitting those actions. It's very handy when the application is under heavy development, and the requirements change often
- The suggested structure for a Redux store is to split the state object into multiple “slices” or “domains” by key, and provide a separate reducer function to manage each individual data slice

## Glossary

### State
State (also called the state tree) is a broad term, but in the Redux API it usually refers to the single state value that is managed by the store and returned by getState(). It represents the entire state of a Redux application, which is often a deeply nested object.

By convention, the top-level state is an object or some other key-value collection like a Map, but technically it can be any type. Still, you should do your best to keep the state serializable. Don't put anything inside it that you can't easily turn into JSON.

### Action
An action is a plain object that represents an intention to change the state. Actions are the only way to get data into the store. Any data, whether from UI events, network callbacks, or other sources such as WebSockets needs to eventually be dispatched as actions.

Actions must have a type field that indicates the type of action being performed. Types can be defined as constants and imported from another module. It's better to use strings for type than Symbols because strings are serializable.

Other than type, the structure of an action object is really up to you

### Reducer
A reducer (also called a reducing function) is a function that accepts an accumulation and a value and returns a new accumulation. They are used to reduce a collection of values down to a single value.

Reducers are not unique to Redux—they are a fundamental concept in functional programming. Even most non-functional languages, like JavaScript, have a built-in API for reducing. In JavaScript, it's Array.prototype.reduce().

In Redux, the accumulated value is the state object, and the values being accumulated are actions. Reducers calculate a new state given the previous state and an action. They must be pure functions—functions that return the exact same output for given inputs. They should also be free of side-effects. This is what enables exciting features like hot reloading and time travel.

Reducers are the most important concept in Redux.

Do not put API calls into reducers.

### Dispatching Function
A dispatching function (or simply dispatch function) is a function that accepts an action or an async action

We must distinguish between dispatching functions in general and the base dispatch function provided by the store instance without any middleware.

The base dispatch function always synchronously sends an action to the store's reducer, along with the previous state returned by the store, to calculate a new state. It expects actions to be plain objects ready to be consumed by the reducer.

Middleware wraps the base dispatch function. It allows the dispatch function to handle async actions in addition to actions. Middleware may transform, delay, ignore, or otherwise interpret actions or async actions before passing them to the next middleware.

### Action Creator
An action creator is, quite simply, a function that creates an action. Do not confuse the two terms—again, an action is a payload of information, and an action creator is a factory that creates an action.

Calling an action creator only produces an action, but does not dispatch it. You need to call the store's dispatch function to actually cause the mutation. Sometimes we say bound action creators to mean functions that call an action creator and immediately dispatch its result to a specific store instance.

If an action creator needs to read the current state, perform an API call, or cause a side effect, like a routing transition, it should return an async action instead of an action.

### Async Action
An async action is a value that is sent to a dispatching function, but is not yet ready for consumption by the reducer. It will be transformed by middleware into an action (or a series of actions) before being sent to the base dispatch() function. Async actions may have different types, depending on the middleware you use. They are often asynchronous primitives, like a Promise or a thunk, which are not passed to the reducer immediately, but trigger action dispatches once an operation has completed.

### Middleware
A middleware is a higher-order function that composes a dispatch function to return a new dispatch function. It often turns async actions into actions.

Middleware is composable using function composition. It is useful for logging actions, performing side effects like routing, or turning an asynchronous API call into a series of synchronous actions.

See applyMiddleware(...middlewares) for a detailed look at middleware.

### Store
A store is an object that holds the application's state tree.

There should only be a single store in a Redux app, as the composition happens on the reducer level.

* dispatch(action) is the base dispatch function described above.
* getState() returns the current state of the store.
* subscribe(listener) registers a function to be called on state changes.
* replaceReducer(nextReducer) can be used to implement hot reloading and code splitting. Most likely you won't use it.

## API Reference
The Redux API surface is tiny. This section documents the complete Redux API. Keep in mind that Redux is only concerned with managing the state. In a real app, you'll also want to use UI bindings like react-redux.

### Top-Level Exports
Every function described above is a top-level export. You can import any of them like this:
```
  import { createStore } from 'redux'
```
#### **createStore(reducer, [preloadedState], [enhancer])**
  Creates a Redux store that holds the complete state tree of your app.
  There should only be a single store in your app.
  
  **Arguments**
  1. reducer (Function): A reducing function that returns the next state tree, given the current state tree and an action to handle.
  2. [preloadedState] (any): The initial state. You may optionally specify it to hydrate the state from the server in universal apps, or to restore a previously serialized user session. If you produced reducer with combineReducers, this must be a plain object with the same shape as the keys passed to it. Otherwise, you are free to pass anything that your reducer can understand.
  3. [enhancer] (Function): The store enhancer. You may optionally specify it to enhance the store with third-party capabilities such as middleware, time travel, persistence, etc. The only store enhancer that ships with Redux is applyMiddleware().

  **Returns**
  
  (Store): An object that holds the complete state of your app. The only way to change its state is by dispatching actions. You may also subscribe to the changes to its state to update the UI.

















