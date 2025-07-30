const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.cookies.token; 

    if (!token) {
        return res.status(401).json({ message: "No token, auth denied" })
    };

    try{
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);  
        req.userId = decodedToken.id;  
        next();  

    } catch(err){
        res.send({
            message: err.message,
            success: false
        })
    }

}
