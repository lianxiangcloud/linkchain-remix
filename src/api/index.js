// import Web3 from 'web3'
// let web3

import { ethers } from 'ethers'

let provider

export const testConnect = async (endpoint) => {
  if (!endpoint) {
    throw new Error('RPC endpoint is null')
  }

  try {
    provider = new ethers.providers.JsonRpcProvider(endpoint)

    let accounts = await provider.listAccounts()
    if (accounts.length > 0) {
      return accounts
    }
  } catch (error) {
    throw new Error(`Test connect error: ${error}`)
  }
}

export const getAccounts = () => {
  return provider.listAccounts()
}

export const getBalance = (address) => {
  return provider.getBalance(address)
}

export const getContractInstance = (contract) => {
  return new ethers.Contract(contract.address, contract.abi, provider)
}

export const getSigner = (account) => {
  return provider.getSigner(account)
}

export const ethSendTransaction = async (tx) => {
  return provider.send('eth_sendTransaction', [tx])
}

export const getTransactionReceipt = (txHash) => {
  return provider.send('eth_getTransactionReceipt', [txHash])
}

export const getTransactionReceiptLoop = (txHash, timeout = 5000) => {
  let getContractReceiptTimer, timer = 0  

  return new Promise((resolve, reject) => {
    getContractReceiptTimer = setInterval(() => {
      timer += 500
      if (timer > timeout) {
        clearInterval(getContractReceiptTimer)
        return reject('Get transaction receipt time out!')
      }
  
      getTransactionReceipt(txHash).then(res => {
        if (res) {
          clearInterval(getContractReceiptTimer)
          return resolve(res)
        }
      })
    }, 500)
  })
}