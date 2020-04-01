import React, { useState, useEffect } from 'react'
import { Input, Button, Row, Col } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { DownOutlined, UpOutlined, CopyOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons'
import copy from 'copy-to-clipboard'
import { deleteContract } from '../deploy/DeploySlice'
import _ from 'underscore'
import { getContractInstance, ethSendTransaction, getTransactionReceiptLoop } from '../../api'

export const MethodInput = (props) => {

  const { abi, onSubmit } = props
  const [ showInputs, setShowInputs ] = useState(false)
  const [ inputValues, setInputValues ] = useState([])
  const [ loading, setLoading ] = useState(false)
  const [ outputRes, setOutputRes ] = useState([])
  const [ errorMsg, setErrorMsg ] = useState('')

  const getMethodName = () => {
    if (abi.type === 'constructor') {
      return 'Deploy'
    }
    if (abi.name) {
      return abi.name
    }
    return 'fallback'
  }

  const handleInputChange = (e, index) => {
    let values = _.clone(inputValues)
    values[index] = e.target.value
    setInputValues(values)
  }

  const parseInputValues = (values) => {
    return values.map(v => {
      return v.trim()
    })
  }

  const handleSubmit = () => {
    // callback to set loading and res
    setErrorMsg('')
    setLoading(true)
    onSubmit(parseInputValues(inputValues), function(res) {
      console.info(res)
      if (res && res.outputs) {
        setOutputRes(res.outputs)
      }
      if (res && res.errorMsg) {
        setErrorMsg(res.errorMsg.message)
      }
      setLoading(false)
    })
  }

  return (
    <>
      {
        !showInputs &&
        <Row gutter={[0, 10]}>
          <Col span={10}>
            <Button onClick={handleSubmit} type={abi.stateMutability === 'view' ? '' : 'primary'}>
              { loading && <LoadingOutlined /> } {getMethodName()}
            </Button>
          </Col>
          {
            abi.inputs && abi.inputs.length > 0 && 
            <>
              <Col span={13}>
                <Input 
                  placeholder={abi.inputs.length > 0 && _.pluck(abi.inputs, 'type').join(', ')} 
                  value={inputValues.join(',')} 
                  onChange={e => {setInputValues(e.target.value.split(','))}}/>
              </Col>
              <Col span={1}><DownOutlined onClick={() => setShowInputs(true)}/></Col>
            </>
          }
        </Row>
      }
      {
        showInputs &&
        <Row className="abiInputsPannel" gutter={[6, 10]}>
          <Col>
            function: {getMethodName()}
            <span style={{float: "right"}}><UpOutlined onClick={() => {setShowInputs(false)}}/></span>
          </Col>
          {
            abi.inputs && abi.inputs.length > 0 && 
            abi.inputs.map((input, index) => (
              <div key={index}>
                <Col span={8} style={{textAlign: "right"}}>{input.name}</Col>
                <Col span={16}>
                  <Input 
                    placeholder={input.type} 
                    value={inputValues[index]} 
                    onChange={e => { handleInputChange(e, index) }}/>
                </Col>
              </div>
            ))
          }
          <Col span={24}>
            <Button type="primary" onClick={handleSubmit}>{ loading && <LoadingOutlined /> } Transact</Button>
          </Col>
        </Row>
      }
      {
        abi.outputs && abi.outputs.length > 0 && 
        (<Row>
          {
            outputRes.map((output, index) => (
              <Col key={index}>{index} {output.name} {output.type ? `(${output.type})` : ''}: {output.value}</Col>
            ))
          }
        </Row>)
      }
      { errorMsg && <Row><Col className="errorColor">{errorMsg}</Col></Row>}
    </>
  )
}

export const Contract = (props) => {

  const { contract } = props
  const { currentAccount, txMeta } = useSelector(state => state.accounts)
  const [ showFuncs, setShowFuncs ] = useState(false)
  const [ instance, setInstance ] = useState(contract)
  const dispatch = useDispatch()

  useEffect(() => {
    setInstance(getContractInstance(contract))
  }, [contract])

  const handleCopy = () => {
    copy(instance.address)
  }

  const parseOutput = (res, outputs) => {
    if (res && !_.isArray(res)) {
      let parsedOutput = {
        value: res.toString(),
        type: outputs[0].type ? outputs[0].type : '',
        name: outputs[0].name ? outputs[0].name : '',
      }
      return [parsedOutput]
    }
    if (res && _.isArray(res) && res.length > 1) {
      return _.map(res, (value, index) => {
        return {
          value: value.toString(),
          type: outputs[index].type ? outputs[index].type : '',
          name: outputs[index].name ? outputs[index].name : '',
        }
      })
    }
    return []
  }

  const handleSubmit = async (abi, v, cb) => {
    try {
      if (abi.stateMutability === 'view') {
        console.info(v)
        let res = await instance.functions[abi.name].call(this, ...v)
        cb({outputs: parseOutput(res, abi.outputs)})
      } else {
        let data = instance.interface.functions[abi.name].encode(v)
        let tx = Object.assign({data, to: instance.address}, txMeta, {from: currentAccount})
        let txHash = await ethSendTransaction(tx)
        let res = await getTransactionReceiptLoop(txHash)
  
        if (res) {
          if (res.status === '0x1') {
            cb()
          } else if (res.status == '0x0') {
            cb({errorMsg: new Error(res.vmerr)})
          }
        }
      } 
    } catch (error) {
      console.error(error)
      cb({errorMsg: error})
    }
  }

  return (
    <div className={showFuncs ? 'contractPannel' : ''}>
      <Row className="row">
        <Col className="contractCol">
          {contract.name} at({`${instance.address.substr(0, 6)}....${instance.address.substr(-8)}`})
          <span style={{float: "right"}}>
            { 
              showFuncs ? 
              <UpOutlined style={{paddingLeft: "10px"}} onClick={() => setShowFuncs(!showFuncs)}/> : 
              <DownOutlined style={{paddingLeft: "10px"}} onClick={() => {setShowFuncs(!showFuncs)}}/> 
            }
            <CopyOutlined style={{paddingLeft: "10px"}} onClick={handleCopy} />
            <CloseCircleOutlined style={{paddingLeft: "10px"}} onClick={() => {dispatch(deleteContract(instance.address))}}/>
          </span>
        </Col>
      </Row>
      {
        showFuncs &&
        _.filter(instance.interface.abi, el => el.type == 'function').map((abi, index) => (
          <MethodInput key={index} abi={abi} onSubmit={(v, cb) => handleSubmit(abi, v, cb)}/>
        ))
      }
    </div >
  )
}

