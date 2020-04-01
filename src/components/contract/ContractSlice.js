import { createSlice } from '@reduxjs/toolkit';
import { ethSendTransaction, getTransactionReceipt } from '../../api'

export const slice = createSlice({
  name: 'contract',
  initialState: {
    contracts: {}
  },
  reducers: {
    setContract: (state, action) => {
      state.contracts[action.payload.address] = action.payload.contract
    },
    deleteContract: (state, action) => {
      delete state.contracts[action.payload]
    },
    clearContracts: (state) => {
      state.contracts = {}
    }
  }
})

export const { setContract, deleteContract, clearContracts } = slice.actions

export const sendTransaction = (txParams) => async (dispatch, getState) => {
  let { accounts } = getState()
  let { currentAccount, txMeta } = accounts
  
  try {
    let tx = Object.assign(txParams, txMeta, {from: currentAccount})
    let txHash = await ethSendTransaction(tx)
    let getContractReceiptTimer, timerN = 0  

    getContractReceiptTimer = setInterval(() => {
      timerN ++
      if (timerN > 10) {
        clearInterval(getContractReceiptTimer)
        throw new Error('Get transaction time out!')
      }

      getTransactionReceipt(txHash).then(res => {
        if (res) {
          clearInterval(getContractReceiptTimer)
          if (res.status === '0x0') {
            throw new Error(res.vmerr)
          }
        }
      })
    }, 500)
  } catch (error) {

  }
}

export default slice.reducer