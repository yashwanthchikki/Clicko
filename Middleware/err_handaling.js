function errorHandler(err, req, res, next) {
    console.error(err.stack); 

    // Set default status code and message
    const status = err.status || 500;
    const message = err.message || 'Something went wrong!';

    res.status(status).json({ error: message });
}

module.exports =errorHandler;
