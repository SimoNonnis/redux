import { createStore, applyMiddleware, combineReducers } from 'redux';
import logger from 'redux-logger';


// REDUCERS <==========================================
const userReducer = function (state = {}, action) {
  switch (action.type) {
    case 'ADD_USER':
      return Object.assign({}, state, {name: action.payload} )
    default:
      return state
  }
};

const postsReducer = function (state = [], action) {
  return state;
};

const rootReducer = combineReducers({
  user: userReducer,
  posts: postsReducer
});
// ====================================================

// MIDDLEWARE <==========================================

const middleware = applyMiddleware(logger());

// ====================================================

// STORE INIT <==========================================
const store = createStore(rootReducer, middleware);
// ====================================================

store.dispatch({ type: 'ADD_USER', payload: 'Simon' });
