// ✅ Make sure this import path matches your actual HR model file!
import { HumanResources } from "../models/HR.model.js";

export const RoleAuthorization = (requiredRole) => {
  return (req, res, next) => {
    if (!req.role) {
      return res.status(403).json({
        success: false,
        message: "Role not found",
      });
    }

    // ✅ normalize both sides
    if (req.role.toLowerCase() !== requiredRole.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};

// ─── NEW: RBAC PERMISSION CHECKER ───
export const CheckPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            // 1. Super Admins automatically bypass all permission checks
            if (req.role === "HR-Admin") {
                return next();
            }

            // 2. For regular HR, fetch their data and populate their RBAC role
            const hr = await HumanResources.findById(req.HRid).populate("rbacRole");
            if (!hr) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            // 3. Extract the permissions array
            const permissions = hr.rbacRole?.permissions || [];

            // 4. Check if they hold the required permission
            if (permissions.includes(requiredPermission)) {
                return next(); // They have permission, let them through!
            }

            // 5. If they don't have it, block them.
            return res.status(403).json({ 
                success: false, 
                message: `Access denied. Required permission: ${requiredPermission}` 
            });

        } catch (error) {
            console.error("Permission Check Error:", error);
            return res.status(500).json({ success: false, message: "Internal server error during permission check" });
        }
    };
};