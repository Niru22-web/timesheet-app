export const authorize = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "Forbidden: No user role found" });
    }
    
    // Case-insensitive role checking
    const userRole = req.user.role.toLowerCase();
    const allowedRoles = roles.map(role => role.toLowerCase());
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: `Forbidden: Requires ${roles.join(' or ')} role, but user has ${req.user.role}` 
      });
    }
    
    next();
  };
};