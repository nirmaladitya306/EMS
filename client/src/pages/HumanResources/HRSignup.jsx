import { SignUP } from "../../components/common/sign-up";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import LoadingBar from "react-top-loading-bar";
import { useNavigate } from "react-router-dom";
import { CommonStateHandler } from "../../utils/commonhandler.js";
import {
  HandlePostHumanResources,
} from "../../redux/Thunks/HRThunk.js";
import { HR_CLEAR_ERROR } from "../../redux/Slices/HRSlice";

export const HRSignupPage = () => {
  const HRState = useSelector((state) => state.HRReducer);
  const [errorpopup, seterrorpopup] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loadingbar = useRef();

  const [signupform, set_signuform] = useState({
    firstname: "",
    lastname: "",
    email: "",
    contactnumber: "",
    password: "",
    textpassword: "",
    name: "",
    description: "",
    OrganizationURL: "",
    OrganizationMail: "",
  });

  const handlesignupform = (event) => {
    CommonStateHandler(signupform, set_signuform, event);
  };

  const handlesubmitform = async (event) => {
    event.preventDefault();

    if (signupform.textpassword !== signupform.password) {
      seterrorpopup(true);
      return;
    }

    seterrorpopup(false);
    dispatch(HR_CLEAR_ERROR());

    if (loadingbar.current) {
      loadingbar.current.continuousStart();
    }

    const result = await dispatch(
      HandlePostHumanResources({
        apiroute: "SIGNUP",
        data: signupform,
      })
    );

    if (loadingbar.current) {
      loadingbar.current.complete();
    }

    // ✅ redirect ONLY after successful signup
    if (result.payload?.success) {
      navigate("/auth/hr/verify-email");
    }
  };

  useEffect(() => {
    if (HRState.error?.status && loadingbar.current) {
      loadingbar.current.complete();
    }
  }, [HRState.error?.status]);

  return (
    <>
        <LoadingBar ref={loadingbar} color="#6366f1" />
        <SignUP stateformdata={signupform} handlesignupform={handlesignupform} handlesubmitform={handlesubmitform} errorpopup={errorpopup} />
    </>
)
};