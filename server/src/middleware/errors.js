const { ZodError } = require('zod');
const mongoose = require('mongoose');

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Parses req[source] with a zod schema and replaces it with the clean result.
const validate = (schema, source = 'body') => (req, _res, next) => {
  const parsed = schema.parse(req[source]);
  if (source === 'query') req.validQuery = parsed;
  else req[source] = parsed;
  next();
};

function notFound(_req, _res, next) {
  next(new HttpError(404, 'Not found'));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Please check the highlighted fields',
      fields: Object.fromEntries(err.issues.map((i) => [i.path.join('.'), i.message])),
    });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: `Invalid ${err.path}` });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'value';
    return res.status(409).json({ error: `That ${field} is already registered` });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
}

module.exports = { HttpError, validate, notFound, errorHandler };
