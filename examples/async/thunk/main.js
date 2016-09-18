import { createStore, applyMiddleware, combineReducers } from 'redux';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import promise from 'redux-promise-middleware';


// REDUCERS <==========================================
const initialState = {
  fetching: false,
  fetched: false,
  error: null,
  usersList: [],
}
const userReducer = function (state = initialState, action) {
  switch (action.type) {
    case 'FETCH_USERS_PENDING':
      return Object.assign({}, state, {fetching: true})
    case 'FETCH_USERS_REJECTED':
      return Object.assign({}, state, {
        fetching: false,
        error: action.payload
      })
    case 'FETCH_USERS_FULFILLED':
      return Object.assign({}, state, {
        fetching: false,
        fetched: true,
        usersList: action.payload
      })
    default:
      return state
  }
};

const postsReducer = function (state = [], action) {
  return state;
};

const rootReducer = combineReducers({
  users: userReducer,
  posts: postsReducer
});
// ====================================================

// MIDDLEWARE <==========================================

const middleware = applyMiddleware(promise(), thunk, logger());

// ====================================================

// STORE INIT <==========================================
const store = createStore(rootReducer, middleware);
// ====================================================

// MANUAL
// store.dispatch((dispatch) => {
//   dispatch({ type: 'FETCH_USERS_PENDING'})
//
//   fetch('http://jsonplaceholder.typicode.com/users')
//     .then((response) => response.json())
//     .then((response) => {
//       dispatch({ type: 'FETCH_USERS_FULFILLED', payload: response })
//     })
//     .catch((error) => {
//       dispatch({type: 'FETCH_USERS_REJECTED', payload: error})
//     })
//
// })

// WITH REDUX-PROMISE-MIDDLEWARE
store.dispatch({
  type: 'FETCH_USERS',
  payload: fetch('http://jsonplaceholder.typicode.com/users')
})
