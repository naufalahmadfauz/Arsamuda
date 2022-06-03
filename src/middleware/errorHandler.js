const errorHandler = (err,req,res,next)=>{
    if (res.headersSent){
        return next(err)
    }else
    res.status(err.statusCode || 500).send({err:err.message});
}

module.exports = errorHandler