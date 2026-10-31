import React from 'react'
import PaySlipPage from '../components/PaySlipPage/PaySlipPage'
import { useOutletContext } from 'react-router-dom'

const PaySlip = () => {
    const { notify } = useOutletContext();


  return <PaySlipPage notify={notify}/>;
}

export default PaySlip