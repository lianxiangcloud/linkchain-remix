import { configureStore } from '@reduxjs/toolkit'
import lkconnectReducer from '../components/lkconnect/lkconnectSlice'
import accountsReducer from '../components/accounts/AccountsSlice'
import deployReducer from '../components/deploy/DeploySlice'
import contractReducer from '../components/contract/ContractSlice'

export default configureStore({
  reducer: {
    lkconnect: lkconnectReducer,
    accounts: accountsReducer,
    deploy: deployReducer,
    contract: contractReducer
  },
});
