
export function errorHandler(err, req, res, next) {
    if (err.code === "23505") {
          return res.status(409).json({ error: "El email ya está registrado" });
      }
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    error: message,
    status: statusCode
  });
}