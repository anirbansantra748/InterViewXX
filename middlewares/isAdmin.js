module.exports.isAdmin = (req,res,next) => {
    if(req.user && req.user.isAdmin) {
        next();
    } else {
        return res.status(403).send("Access denied. Admins only.");
    }
}
