import { Verify_Email_Component } from "../../components/common/verify-email.jsx";
import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { HandlePostHumanResources } from "../../redux/Thunks/HRThunk.js";
import LoadingBar from "react-top-loading-bar";
import { useNavigate } from "react-router-dom";

export const VerifyEmailPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const loadingbar = useRef(null);

    const [verificationcode, setverificationcode] =
        useState("");

    const handleCodeValue = (value) => {
        setverificationcode(value);
    };

    const handleOTPsubmit = async () => {
        if (loadingbar.current) {
            loadingbar.current.continuousStart();
        }

        const result = await dispatch(
            HandlePostHumanResources({
                apiroute: "VERIFY_EMAIL",
                data: { verificationcode }
            })
        );
        console.log("VERIFY RESULT FULL:", result);
        console.log("VERIFY PAYLOAD:", result?.payload);
        console.log("VERIFY SUCCESS:", result?.payload?.success);
        console.log("VERIFY RESPONSE:", result);

        // ✅ SUCCESS → DIRECT NAVIGATION
        if (result?.payload?.success) {
            if (loadingbar.current) {
                loadingbar.current.complete();
            }

            navigate(
                "/hr/dashboard/dashboard-data",
                { replace: true }
            );

            return;
        }

        // ❌ FAILURE → STOP LOADING
        if (loadingbar.current) {
            loadingbar.current.complete();
        }
    };

    return (
        <>
            <LoadingBar ref={loadingbar} />

            <Verify_Email_Component
                handleCodeValue={handleCodeValue}
                value={verificationcode}
                handleOTPsubmit={handleOTPsubmit}
            />
        </>
    );
};