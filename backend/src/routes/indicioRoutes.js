const express = require('express');
const indicioController = require('../controllers/indicioController');
const { validateRequest } = require('../middleware/joiValidation');
const { indicioSchemas } = require('../schemas');

const router = express.Router();

router.get('/', validateRequest(indicioSchemas.queryExpediente, 'query'), indicioController.getAllIndicios);

router.get('/:id', validateRequest(indicioSchemas.idParam, 'params'), indicioController.getIndicioById);

router.post('/', validateRequest(indicioSchemas.create, 'body'), indicioController.createIndicio);

router.put('/:id', validateRequest(indicioSchemas.idParam, 'params'), validateRequest(indicioSchemas.update, 'body'), indicioController.updateIndicio);

router.put('/:id/estado', validateRequest(indicioSchemas.idParam, 'params'), validateRequest(indicioSchemas.updateEstado, 'body'), indicioController.updateIndicioEstado);

router.delete('/:id', validateRequest(indicioSchemas.idParam, 'params'), indicioController.deleteIndicio);

router.get('/expediente/:expedienteId', validateRequest(indicioSchemas.expedienteIdParam, 'params'), indicioController.getIndiciosByExpediente);

router.get('/tecnico/:tecnicoId', validateRequest(indicioSchemas.tecnicoIdParam, 'params'), indicioController.getIndiciosByTecnico);

module.exports = router;