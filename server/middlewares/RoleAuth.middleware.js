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