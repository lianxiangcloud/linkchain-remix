import React, { useState, useEffect } from 'react'
import { Select, Button, Row, Col, Input } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { LoadingOutlined, DeleteOutlined } from '@ant-design/icons'
import { MethodInput, Contract } from '../contract/Contract'
import _ from 'underscore'
import { deployContract, clearContracts, setContract } from './DeploySlice'

export default () => {

  const dispatch = useDispatch()
  const { compilation, deployInfo, contracts } = useSelector(state => state.deploy)
  const [ selected, setSelected ] = useState('')
  const [ constructorFunc, setConstructorFunc ] = useState(false)
  const [ atValue, setAtValue ] = useState('')

  useEffect(() => {
    if (compilation && compilation.length > 0) {
      setSelected(compilation[0])
    }
  }, [compilation])

  useEffect(() => {
    let constructorFunc = _.find(selected.abi, el => el.type === 'constructor')
    setConstructorFunc(constructorFunc)
  }, [selected])

  const handleSelect = (v) => {
    let selectedItem = _.find(compilation, (el) => el.name === v)

    if (selectedItem) {
      setSelected(selectedItem)
    }
  }

  const handleDeploy = (v, cb) => {
    dispatch(deployContract(selected, v)).then(() => {
      cb({errorMsg: deployInfo.errorMsg})
    })
  }

  const handleAttach = () => {
    dispatch(setContract({
      address: atValue,
      ...selected
    }))
  }

  return (
    <div>
      Compiled contracts:
      <Select
        style={{ width: "100%", marginBottom: "5px"}}
        value={selected.name}
        onChange={handleSelect}>
        {
          compilation && compilation.length > 0 &&
          compilation.map(compiled => (
            <Select.Option value={compiled.name} key={compiled.name}>{compiled.name}</Select.Option>
          ))
        }
      </Select>
      <Row gutter={[16, 5]} >
        <Col>
          {
            constructorFunc ? 
              <MethodInput abi={constructorFunc} onSubmit={(v, cb) => {handleDeploy(v, cb)}}/> : 
              <Button type="primary" onClick={() => dispatch(deployContract(selected))}>
                { deployInfo.status === 'deploying' && <LoadingOutlined /> } Deploy
              </Button>
          }
        </Col>
        <Col>Or</Col>
        <Col span={4}>
          <Button onClick={handleAttach}>At</Button>
        </Col>
        <Col span={20}>
          <Input placeholder="deployed contract address" value={atValue} onChange={e => setAtValue(e.target.value)} />
        </Col>
      </Row>
      <Row>
        <Col className="errorColor">{deployInfo.errorMsg}</Col>
      </Row>
      {
        contracts && Object.keys(contracts).length > 0 && 
        <>
          <Row className="row">
            <Col>
              <span>Deployed contracts:</span>
              <span style={{float: "right"}}>
                <DeleteOutlined onClick={() => {dispatch(clearContracts())}}/>
              </span>
            </Col>
          </Row>
          {
            Object.keys(contracts).map(address => (
              <Contract key={address} contract={contracts[address]} />
            ))
          }
        </>
      }
    </div>
  )
}

