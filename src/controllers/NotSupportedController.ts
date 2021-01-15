exports.notSupported = (req, res, next) => {
    res.status(403);
    res.end('Operation not supported');
}