import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { combineReducers, createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { App } from './components'
import { socket, music } from './reducers'
import './main.scss'

const rootReducer = combineReducers({
  socket,
  music,
})

const STORE = createStore(rootReducer)

ReactDOM.render(
  <Provider store={STORE}>
    <App />
  </Provider>,
  document.getElementById('root')
)