import React, { useState, useEffect } from 'react'
import { Select, Row, Col, Button, Input } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { setCurrentAccount, setTxMeta } from './AccountsSlice'
import { utils as ethersUtils} from 'ethers'
import copy from 'copy-to-clipboard'
import { DownOutlined, UpOutlined, CopyOutlined } from '@ant-design/icons'

export default () => {

  const { accounts, currentAccount } = useSelector(state => state.accounts)
  const [ showTxMeta, setShowTxMeta ] = useState(false)
  const [ unit, setUnit ] = useState('ether')
  const [ gasLimit, setGasLimit ] = useState(300000)
  const [ value, setValue ] = useState(0)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!value) {
      dispatch(setTxMeta({ value: '0x0' }))
    } else {
      dispatch(setTxMeta({
        value: ethersUtils.parseUnits(value, unit).toHexString()
      }))
    }
  }, [value, unit])

  useEffect(() => {
    if (!gasLimit) {
      dispatch(setTxMeta({ gasLimit: '0x0' }))
    } else {
      dispatch(setTxMeta({
        gasLimit: ethersUtils.hexStripZeros(ethersUtils.bigNumberify(gasLimit).toHexString())
      }))
    }
  }, [gasLimit])

  const handleCopy = () => {
    copy(currentAccount)
  }

  const AccountOption = ({ account }) => (
    <>
      <span>{account.address.substr(0, 12)}...{account.address.substr(-8)} / {ethersUtils.formatEther(account.balance)}ether</span>
    </>
  )

  return (
    <div>
      <Row className="row">
        <Col>
          Accounts:
          <Button style={{float: "right", marginBottom: "5px"}} onClick={() => {setShowTxMeta(!showTxMeta)}}>
            TxMeta { showTxMeta ? <DownOutlined /> : <UpOutlined /> }
          </Button>
        </Col>
        <Col span={22}>
          <Select
            disabled={accounts.length === 0}
            value={currentAccount}
            onChange={(v) => { dispatch(setCurrentAccount(v)) }}
            style={{ width: "100%" }}>
            {
              accounts.length > 0 &&
              accounts.map(account => (
                <Select.Option value={account.address} key={account.address}><AccountOption account={account} /></Select.Option>
              ))
            }
          </Select>
        </Col>
        <Col span={2}><CopyOutlined style={{paddingLeft: "10px"}} onClick={handleCopy}/></Col>
      </Row>
      {
        showTxMeta && 
        <>
          <Row gutter={[6, 5]}>
            <Col span={6}>GasLimit</Col>
            <Col span={18}>
              <Input value={gasLimit} onChange={(e) => {setGasLimit(e.target.value)}}/>
            </Col>
          </Row>
          <Row gutter={[6, 5]}>
            <Col span={6}>Value</Col>
            <Col span={12}>
              <Input value={value} onChange={(e) => {setValue(e.target.value)}}/>
            </Col>
            <Col span={6}>
              <Select value={unit} onChange={v => setUnit(v)}>
                <Select.Option value="ether">ether</Select.Option>
                <Select.Option value="wei">wei</Select.Option>
              </Select>
            </Col>
          </Row>
        </>
      }
    </div>
  )
}
