var mongoose = require('mongoose');
var Schema = mongoose.Schema;



module.exports.getUserModel = function () {

    mongoose.connect("mongodb://localhost/re_db");
//    mongoose.connect("mongodb://jethro:michyboy237@linus.mongohq.com:10037/imba_db");
    console.log("Connected to mongoose");
    var productSchema = new Schema({
        category: String,
        description: String,
        floorArea: Number,
        galleryImages: [{path: String, imageDescription: String}],
        thumbnailImages: [String],
        lotArea: Number,
        name: String,
        price: Number,
        city: String,
        bath: Number,
        beds: Number,
        primaryImage: String,
        features: [String],
        details: [String],
        createdAt: { type: Date, default : Date.now },
        updatedAt: { type: Date, default : Date.now }
    });

    var userSchema = new Schema({
        username: String,
        password: String,
        email: String,
        phone: [String],
        products : [productSchema]
    });

//    mongoose.model('Products', productSchema);
    var User = mongoose.model('Users', userSchema);

    return User;
    /*Product.find(function (err, kittens) {
        if (err) return console.error(err);
        console.log(kittens)
    })*/
//    return Product;
    /*var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function callback() {
        console.log("YAY CONNECTED!")
    });*/
}