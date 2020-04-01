import React, { useEffect } from 'react'
import { LoadingOutlined } from '@ant-design/icons';
import { Input, Button, Row, Col } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { handleConnect, setConnect } from './lkconnectSlice'
import { setAccountsAsync } from '../accounts/AccountsSlice';
import { clearContracts } from '../deploy/DeploySlice';

export default () => {

  const { isConnect, RPC, loading, errorMsg } = useSelector(state => state.lkconnect)
  const dispatch = useDispatch()

  useEffect(() => {
    if (isConnect) {
      dispatch(setAccountsAsync())
    }
    if (!isConnect) {
      dispatch(clearContracts())
    }
  }, [isConnect])

  return (
    <div>
      <Row>
        <Col>LkchainRPC:</Col>
        <Col>
          <Input
            disabled={isConnect}
            value={RPC}
            onChange={(e) => dispatch(setConnect({ RPC: e.target.value }))} />
        </Col>
      </Row>
      <Button
        style={{ margin: "10px 10px 10px 0" }}
        onClick={() => dispatch(handleConnect())}
        disabled={loading}
        type="primary">
        {loading && <LoadingOutlined />}
        {isConnect ? 'disconnect' : 'connect'}
      </Button>
      {isConnect && <span className="successColor">Connected</span>}
      {errorMsg && <span className="errorColor">{errorMsg}</span>}
    </div>
  )
}
