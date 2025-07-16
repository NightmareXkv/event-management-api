const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/eventController');


router.post('/', ctrl.createEvent);


router.get('/:id', ctrl.getEvent);


router.post('/register', ctrl.register);


router.post('/cancel', ctrl.cancel);


router.get('/', ctrl.listUpcoming);


router.get('/:id/stats', ctrl.stats);

module.exports = router;
