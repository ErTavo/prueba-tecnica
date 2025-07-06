const express = require('express');

const userRoutes = require('./userRoutes');
const expedienteRoutes = require('./expedienteRoutes');
const indicioRoutes = require('./indicioRoutes');

const router = express.Router();

router.get('/debug', (req, res) => {
  res.json({
    success: true,
    message: "Router principal funcionando",
    availableRoutes: ['/usuarios', '/users', '/expedientes', '/indicios', '/debug']
  });
});

router.use('/usuarios', userRoutes);
router.use('/expedientes', expedienteRoutes);
router.use('/indicios', indicioRoutes);

router.use('/users', userRoutes); 


module.exports = router;
