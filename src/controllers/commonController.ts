exports.notSupported = (req, res, next) => {
    res.status(403);
    res.end('Operation not supported');
}

exports.handleResponse = (data, req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(data);
}