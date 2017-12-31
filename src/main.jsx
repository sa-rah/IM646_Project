import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import loggerMiddleware from 'redux-logger';
import promiseMiddleware from 'redux-promise-middleware';
import App from './App.jsx';
import reducers from './reducers';

const root = document.querySelector('#root');

const middleware = applyMiddleware(promiseMiddleware(), loggerMiddleware);
const store = createStore(reducers, middleware);

ReactDOM.render(
    <Provider store={store}>
        <App/>
    </Provider>,
    root,
);