var mongoose = require('mongoose');
module.exports = function(app) {
    app.get('/db/products', function (req, res) {
        mongoose.model('Products').find(function (err, data) {
            if (err) return console.error(err);
            res.json(data);
        })
    });

}