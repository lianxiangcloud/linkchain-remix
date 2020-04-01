import React from 'react';
import Lkconnect from './components/lkconnect/Lkconnect';
import Accounts from './components/accounts/Accounts';
import Deploy from './components/deploy/Deploy';
import './App.css';
import { useSelector } from 'react-redux';

function App() {
  const { isConnect }= useSelector(state => state.lkconnect)
  
  return (
    <div className="App">
      <Lkconnect />
      {
        isConnect ? 
        <>
          <Accounts />
          <Deploy />
        </>: ''
      }
    </div>
  );
}

export default App;
