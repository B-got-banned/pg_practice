const timestamp = new Date().toISOString();
const reqLogger = (req, res, next) => {
    console.log(`${req.method} request made to ${req.url} on ${req.ip} at ${timestamp}`);
    next();
};
export default reqLogger;
//# sourceMappingURL=reqLogger.js.map