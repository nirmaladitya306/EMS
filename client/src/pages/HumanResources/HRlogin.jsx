import { SignIn } from "../../components/common/sign-in.jsx";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LoadingBar from "react-top-loading-bar";
import { CommonStateHandler } from "../../utils/commonhandler.js";
import {
  HandleGetHumanResources,
  HandlePostHumanResources,
} from "../../redux/Thunks/HRThunk.js";
import { HR_CLEAR_ERROR } from "../../redux/Reducers/HRReducer";

export const HRLogin = () => {
  const HRState = useSelector((state) => state.HRReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loadingbar = useRef();

  const [signinform, setsigninform] = useState({
    email: "",
    password: "",
  });

  const handlesigninform = (event) => {
    CommonStateHandler(signinform, setsigninform, event);
  };

  // ✅ FIX 1: Clear error before login + safe loading start
  const handlesigninsubmit = (e) => {
    e.preventDefault();

    dispatch(HR_CLEAR_ERROR()); // 🔥 important

    if (loadingbar.current) {
      loadingbar.current.continuousStart();
    }

    dispatch(
      HandlePostHumanResources({
        apiroute: "LOGIN",
        data: signinform,
      })
    );
  };

  // ✅ FIX 2: Stop loading on error
  useEffect(() => {
    if (HRState.error?.status && loadingbar.current) {
      loadingbar.current.complete();
    }
  }, [HRState.error?.status]);

  // ✅ FIX 3: Run CHECKLOGIN ONLY ONCE (prevent infinite loop)


  // ✅ FIX 4: Handle successful login
  useEffect(() => {
    if (HRState.isAuthenticated) {
      if (loadingbar.current) {
        loadingbar.current.complete();
      }

      navigate("/hr/dashboard/dashboard-data");
    }
  }, [HRState.isAuthenticated, navigate]);

  return (
    <div>
      <div className="employee-login-content flex justify-center items-center h-[100vh]">
        <LoadingBar ref={loadingbar} />

        <SignIn
          handlesigninform={handlesigninform}
          handlesigninsubmit={handlesigninsubmit}
          targetedstate={HRState}
          statevalue={signinform}
          redirectpath={"/auth/hr/forgot-password"}
          role="HR"
        />
      </div>
    </div>
  );
};