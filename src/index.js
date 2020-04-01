import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import store from './store';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';
import { createIframeClient } from '@remixproject/plugin'
import { addCompilation } from './components/deploy/DeploySlice'

const client = createIframeClient()

client.onload(async () => {
  ReactDOM.render(
    <Provider store={store}>
      <App client={client}/>
    </Provider>,
    document.getElementById('root')
  )

  let compiled = await client.solidity.getCompilationResult()

  if (compiled && compiled.data) {
    store.dispatch(addCompilation(compiled))
  }

  client.on('solidity', 'compilationFinished', (fileName, source, version, data) => {
    store.dispatch(addCompilation({data, source}))
  })
})

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
