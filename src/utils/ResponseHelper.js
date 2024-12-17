const sendSuccess = (res, message, data = {}) => {
    res.status(200).json({ success: true, message, data });
};

const sendError = (res, message, error = {}) => {
    res.status(500).json({ success: false, message, error });
};

module.exports = {
    sendSuccess,
    sendError,
};
