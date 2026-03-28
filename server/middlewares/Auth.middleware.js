import jwt from 'jsonwebtoken';

// 🔐 Verify Employee Token
export const VerifyEmployeeToken = (req, res, next) => {
    const token = req.cookies.EMtoken;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized access",
            gologin: true
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.EMid = decoded.EMid;
        req.role = decoded.EMrole;
        req.ORGID = decoded.ORGID;

        next();
    } catch (error) {
        res.clearCookie("EMtoken");
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
            gologin: true
        });
    }
};


// 🔐 Verify HR Token
export const VerifyHRToken = (req, res, next) => {

    const token = req.cookies.HRtoken;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized access",
            gologin: true
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.HRid = decoded.HRid;
        req.ORGID = decoded.ORGID;
        req.role = decoded.HRrole;

        next();
    } catch (error) {
        res.clearCookie("HRtoken");
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
            gologin: true
        });
    }
};