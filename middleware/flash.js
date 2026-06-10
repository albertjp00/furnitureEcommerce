app.use((req, res, next) => {
  res.locals.query = req.query;
  next();
});