import { createSlice } from '@reduxjs/toolkit';
import { getTransactionReceiptLoop, ethSendTransaction } from '../../api'
import { ethers } from 'ethers'


export const slice = createSlice({
  name: 'deploy',
  initialState: {
    compilation: [],
    deployInfo: {
      status: '',
      errorMsg: ''
    },
    contracts: {}
  },
  reducers: {
    addCompilation: (state, action) => {
      let { data, source } = action.payload
      let sourceKey, compiledArray = []

      if (data && data.contracts) {
        sourceKey = Object.keys(data.contracts)[0]

        for (let compiledKey of Object.keys(data.contracts[sourceKey])) {
          let compiledItem = data.contracts[sourceKey][compiledKey]

          compiledArray.push({
            name: compiledKey,
            abi: compiledItem.abi,
            bytecode: compiledItem.evm.bytecode.object,
            source: source.sources[source.target].content
          })
        }
      }
      state.compilation = compiledArray
    },
    setDeployInfo: (state, action) => {
      state.deployInfo = action.payload
    },
    setContract: (state, action) => {
      state.contracts[action.payload.address] = action.payload
    },
    deleteContract: (state, action) => {
      delete state.contracts[action.payload]
    },
    clearContracts: (state) => {
      state.contracts = {}
    }
  }
})

export const { addCompilation, setDeployInfo, setContract, deleteContract, clearContracts } = slice.actions

function parseTxParams(tx) {
  let params = {}

  if (tx.gasLimit <= 0) {
    throw new Error('Gas limit error!')
  }
  params.gas = tx.gasLimit
  if (tx.value && tx.value != '0x00') {
    params.value = tx.value
  } 
  return params
}

export const deployContract = (contract, args=[]) => async (dispatch, getState) => {
  console.info(args)
  dispatch(setDeployInfo({errorMsg: '', status: 'deploying'}))
  let { accounts } = getState()

  if (!accounts.currentAccount) {
    dispatch(setDeployInfo({errorMsg: 'Select a from account to send transaction!', status: 'finish'}))
  }

  try {
    let deployContractFactory = new ethers.ContractFactory(contract.abi, contract.bytecode)
    let deployTx = deployContractFactory.getDeployTransaction(...args)
    let deployTxHash = await ethSendTransaction(Object.assign({}, deployTx, { from: accounts.currentAccount }, {...parseTxParams(accounts.txMeta)}))
    let res = await getTransactionReceiptLoop(deployTxHash)

    if (res) {
      if (res.status === '0x1') {
        dispatch(setContract({
          address: res.contractAddress,
          ...contract
        }))
        dispatch(setDeployInfo({errorMsg: '', status: 'end'}))
      } else if (res.status === '0x0') {
        throw new Error(res.vmerr)
      }
    }
  } catch (error) {
    dispatch(setDeployInfo({errorMsg: error.message, status: 'end'}))
  }
}

export default slice.reducer