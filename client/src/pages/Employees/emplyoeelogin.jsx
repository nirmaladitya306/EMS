import { useState, useEffect, useRef } from "react"
import { SignIn } from "../../components/common/sign-in.jsx"
import { useDispatch, useSelector } from "react-redux"
import { HandlePostEmployees } from "../../redux/Thunks/EmployeeThunk.js"
import LoadingBar from 'react-top-loading-bar'
import { useNavigate } from 'react-router-dom'
import { CommonStateHandler } from "../../utils/commonhandler.js"

export const EmployeeLogin = () => {

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const loadingbar = useRef(null)
    const EmployeeState = useSelector((state) => state.employeereducer)
    const [signinform, set_signinform] = useState({
        email: "",
        password: "",
    })

    const handlesigninform = (event) => {
        CommonStateHandler(signinform, set_signinform, event)
    }

    const handlesigninsubmit = async (e) => {
        e.preventDefault();
        loadingbar.current?.continuousStart();
        dispatch(HandlePostEmployees({ apiroute: "LOGIN", data: signinform }))
    }

    // Stop loading bar on error
    useEffect(() => {
        if (EmployeeState.error.status) {
            loadingbar.current?.complete()
        }
    }, [EmployeeState.error.status])

    // Navigate to dashboard once authenticated
    useEffect(() => {
        if (EmployeeState.isAuthenticated) {
            loadingbar.current?.complete()
            navigate("/auth/employee/employee-dashboard/overview")
        }
    }, [EmployeeState.isAuthenticated])

    return (
        <>
            <LoadingBar ref={loadingbar} color="#6366f1" />
            <SignIn handlesigninform={handlesigninform} handlesigninsubmit={handlesigninsubmit} targetedstate={EmployeeState} statevalue={signinform} redirectpath={"/auth/employee/forgot-password"} role="Employee" />
        </>
    )
}