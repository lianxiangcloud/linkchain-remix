import { createSlice } from '@reduxjs/toolkit';
import { getAccounts, getBalance } from '../../api';

export const slice = createSlice({
  name: 'accounts',
  initialState: {
    accounts: [],
    currentAccount: '',
    txMeta: {
      gasLimit: '300000', // 300000
      value: '0x0'
    },
  },
  reducers: {
    setAccounts: (state, action) => {
      state.accounts = action.payload
    },
    setCurrentAccount: (state, action) => {
      state.currentAccount = action.payload
    },
    setTxMeta: (state, action) => {
      state.txMeta = Object.assign({}, state.txMeta, action.payload)
    }
  }
})

export const { setAccounts, setCurrentAccount, setTxMeta } = slice.actions

export const setAccountsAsync = () => async dispatch => {
  let addresses = await getAccounts()
  let accounts = []

  if (addresses && addresses.length > 0) {
    for (let i = 0; i < addresses.length; i++) {
      let balance = await getBalance(addresses[i])
      accounts.push({
        address: addresses[i],
        balance: balance.toString()
      })
    }
    dispatch(setAccounts(accounts))
    dispatch(setCurrentAccount(accounts[0].address))
  } else {
    dispatch(setAccounts([]))
    dispatch(setCurrentAccount(''))
  }
}

export default slice.reducer
