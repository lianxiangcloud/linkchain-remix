import { createSlice } from '@reduxjs/toolkit';
import { testConnect } from '../../api';

export const slice = createSlice({
  name: 'lkconnect',
  initialState: {
    isConnect: false,
    loading: false,
    RPC: 'http://localhost:36000',
    errorMsg: '',
  },
  reducers: {
    setConnect: (state, action) => {
      return Object.assign({}, state, action.payload)
    }
  }
})

export const { setConnect } = slice.actions

export const handleConnect = () => async (dispatch, getState) => {
  let { isConnect, RPC } = getState().lkconnect

  try {
    dispatch(setConnect({ loading: true }))

    if (isConnect) {    // disconnect rpc
      dispatch(setConnect({ isConnect: false, loading: false }))
    } else {    // connect rpc
      await testConnect(RPC)
      dispatch(setConnect({ isConnect: true, loading: false, errorMsg: '' }))
    }
  } catch (error) {
    dispatch(setConnect({ loading: false, errorMsg: error.message }))
    console.error(error)
  }
}

export default slice.reducer
