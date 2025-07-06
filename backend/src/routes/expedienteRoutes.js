const express = require('express');
const expedienteController = require('../controllers/expedienteController');
const { validateRequest } = require('../middleware/joiValidation');
const { expedienteSchemas } = require('../schemas');

const router = express.Router();

router.get('/', expedienteController.getAllExpedientes);

router.get('/:id', validateRequest(expedienteSchemas.idParam, 'params'), expedienteController.getExpedienteById);

router.post('/', validateRequest(expedienteSchemas.create, 'body'), expedienteController.createExpediente);

router.put('/:id', validateRequest(expedienteSchemas.idParam, 'params'), validateRequest(expedienteSchemas.update, 'body'), expedienteController.updateExpediente);

router.delete('/:id', validateRequest(expedienteSchemas.idParam, 'params'), expedienteController.deleteExpediente);

router.put('/:id/estado', validateRequest(expedienteSchemas.idParam, 'params'), validateRequest(expedienteSchemas.changeEstado, 'body'), expedienteController.changeEstado);

router.get('/tecnico/:tecnicoId', validateRequest(expedienteSchemas.tecnicoIdParam, 'params'), expedienteController.getExpedientesByTecnico);

module.exports = router;