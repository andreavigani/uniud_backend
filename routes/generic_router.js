var express = require('express')

/*
Example call:
require('...', 'bear', [
    {
        path: 'owner', 
        select: ['name', 'department']
    },
    {
        path: 'zoo', 
        select: ['name', 'address']
    }
]

See: http://mongoosejs.com/docs/api.html#document_Document-populate
*/
module.exports = function (model_name, populate_options = null) {
    var router = express.Router()

    var schema = require('../models/' + model_name)

    populate_options = [].concat(populate_options || []); //Accept both single object and array of objects

    //ADD
    router.post('/', (req, res) => {
        var model = new schema(req.body)
        model.save()
            .then(() => res.json({ message: model_name + ' added!' }))
            .catch(error => res.json(error))
    })

    //GET ALL
    router.get('/', (req, res) => {
        var query = schema.find()
        populate_options.forEach(option => {
            query = query.populate(option)
        });
        query.exec()
            .then(models => res.json(models))
            .catch(error => res.json(error))
    })

    //GET SINGLE
    router.get('/:model_id', (req, res) => {
        var query = schema.findOne({ '_id': req.params.model_id })
        populate_options.forEach(option => {
            query = query.populate(option)
        });
        query.exec()
            .then(model => model ? res.json(model) : res.status(404).json({ message: model_name + ' not found' }))
            .catch(error => res.json(error))
    })

    //UPDATE SINGLE
    router.put('/:model_id', function (req, res) {
        schema.findById(req.params.model_id).exec()
            .then(model => {
                if (!model) return res.status(404).json({ message: model_name + ' not found' })
                Object.keys(req.body).forEach(attribute => {
                    if (attribute !== "_id") {
                        model[attribute] = req.body[attribute]
                    }
                })
                return model.save()
            })
            .then(() => res.json({ message: model_name + ' updated!' }))
            .catch(err => res.send(err))
    })

    //DELETE
    router.delete('/:model_id', function (req, res) {
        schema.findById(req.params.model_id)
            .then(model => model ? model.remove() : Promise.reject({ message: model_name + ' not found' }))
            .then(response => res.json({ message: model_name + ' deleted!' }))
            .catch(err => res.json(err))
    })

    return router;
}