import { useState, useEffect, useRef } from "react"
import { SignIn } from "../../components/common/sign-in.jsx"
import { useDispatch, useSelector } from "react-redux"
import LoadingBar from 'react-top-loading-bar'
import { useNavigate } from 'react-router-dom'
import { ForgotPassowrd } from "../../components/common/forgot-password.jsx"
import { HandlePostEmployees } from "../../redux/Thunks/EmployeeThunk.js"

export const ForgotPassword = () => {

    const EmplyoeeState = useSelector((state) => state.employeereducer)
    const loadingbar = useRef(null)
    const [forgotpassowrdform, setforgotpassowrdform] = useState({ email: "" })
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handlesforgotpasswordform = (e) => {
        setforgotpassowrdform({ ...forgotpassowrdform, [e.target.name]: e.target.value })
    }

    const handleforgotpasswordsubmit = (e) => {
        e.preventDefault();
        loadingbar.current?.continuousStart();
        dispatch(HandlePostEmployees({ apiroute: "FORGOT_PASSWORD", data: forgotpassowrdform }))
    }

    // 👇 FIXED: Wrapped in useEffect
    useEffect(() => {
        if ((!EmplyoeeState.isLoading) && (EmplyoeeState.error.status)) { 
            loadingbar.current?.complete()
        }
    }, [EmplyoeeState.isLoading, EmplyoeeState.error.status])

    useEffect(() => {
        if (EmplyoeeState.data) {
            loadingbar.current?.complete()
            navigate("/auth/employee/reset-email-confirmation")
        }
    }, [EmplyoeeState.data])

    return (
        <>
            <LoadingBar ref={loadingbar} color="#6366f1" />
            <ForgotPassowrd handleforgotpasswordsubmit={handleforgotpasswordsubmit} handlesforgotpasswordform={handlesforgotpasswordform} targetState={EmplyoeeState} redirectpath={"/auth/employee/login"} />
        </>
    )
}