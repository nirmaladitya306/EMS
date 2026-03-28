import { HandleGetHumanResources } from "../redux/Thunks/HRThunk.js";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Loading } from "../components/common/loading.jsx";

export const HRProtectedRoutes = ({ children }) => {
    const dispatch = useDispatch();

    const HRState = useSelector(
        (state) => state.HRReducer
    );

    useEffect(() => {
        dispatch(
            HandleGetHumanResources({
                apiroute: "CHECKLOGIN"
            })
        );
    }, [dispatch]);

    if (HRState.loading || HRState.isLoading) {
        return <Loading />;
    }

    // ✅ only check login cookie
    if (HRState.isAuthenticated) {
        return children;
    }

    return (
        <Navigate
            to="/auth/hr/login"
            replace
        />
    );
};