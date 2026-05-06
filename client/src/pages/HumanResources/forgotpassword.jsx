import { useState, useEffect, useRef } from "react"
import { SignIn } from "../../components/common/sign-in.jsx"
import { useDispatch, useSelector } from "react-redux"
import LoadingBar from 'react-top-loading-bar'
import { useNavigate } from 'react-router-dom'
import { ForgotPassowrd } from "../../components/common/forgot-password.jsx"
import { HandlePostHumanResources } from "../../redux/Thunks/HRThunk.js"

export const HRForgotPasswordPage = () => {
    const HRstate = useSelector((state) => state.HRReducer)
    const loadingbar = useRef(null)
    const [forgotpassowrdform, setforgotpassowrdform] = useState({ email: "" }) 
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handlesforgotpasswordform = (e) => {
        setforgotpassowrdform({ ...forgotpassowrdform, [e.target.name]: e.target.value })
    }

    const handleforgotpasswordsubmit = (e) => {
        e.preventDefault();
        loadingbar.current.continuousStart();
        dispatch(HandlePostHumanResources({ apiroute: "FORGOT_PASSWORD", data: forgotpassowrdform }))
    }

    if (HRstate.error.status) {
        loadingbar.current.complete()
    }

    useEffect(() => {
        if (HRstate.data) {
            loadingbar.current.complete()
            navigate("/auth/hr/reset-email-confirmation")
        }
    }, [HRstate.data])


    return (
    <>
        <LoadingBar ref={loadingbar} color="#6366f1" />
        <ForgotPassowrd handleforgotpasswordsubmit={handleforgotpasswordsubmit} handlesforgotpasswordform={handlesforgotpasswordform} targetState={HRstate} redirectpath={"/auth/hr/login"} />
    </>
)
}