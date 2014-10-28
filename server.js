/*var config = {
 test: 'mongodb://localhost/re_db'
 };*/

var express = require('express');
var bcrypt = require('bcryptjs');
var Q = require('q');
var logger = require('morgan');
var mongoose = require('mongoose');

//for authentication
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');

var passport = require('passport');
var passportLocal = require('passport-local');

//for file upload
//var fs = require('fs');
var fs = require('fs-extra');
var im = require('imagemagick');
//var busboy = require('connect-busboy');
var Busboy = require('busboy');
var async = require('async');

var app = express();

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
});

//app.use(busboy());


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressSession({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/public'));

passport.use(new passportLocal.Strategy(function (username, password, done) {
    console.log("Passport Local Strategy commence")
    User.findOne({username: username}, function (err, data) {
        if (data && data.length != 0) {
            console.log("Username matches. Comparing passwords");
            console.log("Queried object password: " + data.password)
            if (bcrypt.compareSync(password, data.password)) {
                console.log("Match! Signing in...");
                done(null, data)
            }
            else {
                done(new Error("Wrong password"));
            }
        }
        else if (err) {
            done(err, null);
        }
        else {
            done(null, null);
        }
    });
}));

passport.serializeUser(function (user, done) {
    console.log("Serialize to session")
    done(null, user.username);
});

passport.deserializeUser(function (username, done) {
    console.log("Deserialize from session " + username)
    //Query database or cache here!
    done(null, {username: username});
});


/*app.get('/', function(req, res){
 res.render('public/admin',{
 isAuthenticated: req.isAuthenticated(),
 user: req.user
 });
 });*/

/*app.get('/login', function (req, res) {
 console.log("BOOM PUNET!");
 res.render('login');
 });*/

app.post('/api/login',
    passport.authenticate('local'),
    function (req, res) {
//        console.log(req.headers)
        console.log("CMOOOOOOOOOON!!")
        // If this function gets called, authentication was successful.
        // `req.user` contains the authenticated user.
//        console.log("My User object: " + req.user)
        res.json({
            isAuthenticated: req.isAuthenticated(),
            user: req.user
        })
    });

app.get('/api/logout', function (req, res) {
    console.log("Logging out..")
    req.session.destroy(function (err) {
        console.log("Destroyed session.");
        res.send('Session deleted'); //Inside a callback… bulletproof!
        /*if(err){
            console.log("Error: " + err);
            res.status(500).send(err.message);
        }
        else{
            res.end("Destroyed session.");
        }*/
    });
});

/*app.get('/:username', function(req, res) {
    res.redirect('/');
});*/

app.get('/:username', function (req, res) {
    console.log("Routing to main page .." + " username: " + req.params.username);
    res.sendFile(__dirname + '/public/views/app.html');
});




app.post('/api/signup', function (req, res) {
    console.log("Sign UP!!")
    var deferred = Q.defer();

//        console.log(req.headers)

    User.find({ username: req.body.username }, function (err, data) {
        if (err) {
            deferred.reject(err);
        }
        else {
            console.log("Continue");
            if (data.length != 0) {
                deferred.reject(new Error("This username is already existing!"));
            }
            else {
                try {
                    console.log("Continue 2");
                    var hash = bcrypt.hashSync(req.body.password, 8);
                    console.log("hash password" + hash);
                    var user = new User({
                        username: req.body.username,
                        password: hash,
                        email: req.body.email,
                        phone: req.body.phone
                    });


                    user.save(function (err, user) {
                        if (err) {
                            deferred.reject(err);
                        }
                        else {
                            console.log("Now Saved!!")
                            deferred.resolve(user)
                        }
                    });
                }
                catch (err) {
                    console.log("CATCHUUUUU!")
                    deferred.reject(err);
                }


            }
        }
    })

    deferred.promise.then(function (data) {

        res.json(data);
    }, function (err) {
        console.log("THE REAAASSSOOONNN!!! " + err);
        res.status(500).send(err.message);
    });
});

app.put('/api/update', function (req, res) {

    console.log("Updating product..")
    console.log("My User object: " + req.body.user.username);

    var id = new mongoose.Types.ObjectId(req.body._id);

    mongoose.model('Users').update(
        {
            "products._id": id
        },
        {
            $set: {
                "products.$.category": req.body.category,
//                "products.$.description": req.body.description,
                "products.$.floorArea": req.body.floorArea,
                "products.$.lotArea": req.body.lotArea,
                "products.$.price": req.body.price,
                "products.$.city": req.body.city,
                "products.$.bath": req.body.bath,
                "products.$.beds": req.body.beds,
                "products.$.features": req.body.features,
                "products.$.details": req.body.details,
                "products.$.galleryImages": req.body.galleryImages,
                "products.$.updatedAt": new Date(),
                "products.$.primaryImage": req.body.primaryImage
            }
        }
        , function (err, result) {
            if (err) {
                console.log(err);
                res.status(500).send(err.message);
            }
            console.log("Product is now updated.")
            res.json(result);
        }
    )
});


app.post('/api/create', function (req, res) {
//        console.log(req.headers)
    console.log("Creating product..")
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    console.log("My User object: " + req.body.user.username);
    var promise = User.findOne({ username: req.body.user.username }).exec();
    promise.then(function (user) {
            try {
//                console.log("Mapping product schema..");
                var id = new mongoose.Types.ObjectId();
                console.log("New generated product id: " + id);
                var product = {
                    _id: id,
                    category: req.body.category,
//                    description: req.body.description,
                    floorArea: req.body.floorArea,
                    lotArea: req.body.lotArea,
                    price: req.body.price,
                    city: req.body.city,
                    bath: req.body.bath,
                    beds: req.body.beds,
                    features: req.body.features,
                    details: req.body.details
                };
                user.products.push(product);

//                console.log("Saving product..")
                user.save(function (err, data) {
                    if (err) {
                        console.log("Error2: ", err);
                        res.status(500).send(err.message);
                    }
                    else {
                        console.log("Product Saved")
                        res.json({"productId": id});
                    }
                })
            }
            catch (err) {
                console.log(err);
                res.status(500).send(err.message);
            }

        },
        function (err) {
            console.log("Error1: ", err);
            res.status(500).send(err.message);
        });
});


app.post('/api/delete', function (req, res) {

    console.log("Deleting product..")
    console.log("My User object: " + req.body.user.username);

    var id = new mongoose.Types.ObjectId(req.body._id);

    mongoose.model('Users').update(
        {
            "username": req.body.user.username
        },
        {
            $pull: {
                "products": {
                    "_id" : id
                }
            }
        }
        , function (err, result) {
            if (err) {
                console.log(err);
                res.status(500).send(err.message);
            }
            console.log("Deleted product.")
            res.json(result);
        }
    )

    var actualSizePath = "public/images/actual-size/" + req.body.user.username + "/" + req.body._id;
    var galleryPath = "public/images/gallery/" + req.body.user.username + "/" + req.body._id;
    var thumbnailPath = "public/images/thumbnails/" + req.body.user.username + "/" + req.body._id;

    fs.remove(actualSizePath, function(err){
        if (err){
            console.error(err);
            res.status(500).send(err.message);
        }
        else{
            console.log("Removed images from " + actualSizePath);
        }
    });

    fs.remove(galleryPath, function(err){
        if (err){
            console.error(err);
            res.status(500).send(err.message);
        }
        else{
            console.log("Removed images from " + galleryPath);
        }
    });

    fs.remove(thumbnailPath, function(err){
        if (err){
            console.error(err);
            res.status(500).send(err.message);
        }
        else{
            console.log("Removed images from " + thumbnailPath);
        }
    });
});

app.post('/api/delete_image', function (req, res) {

    console.log("Deleting image..")
    console.log("My User object: " + req.body.user.username);

    var imageId = new mongoose.Types.ObjectId(req.body.imageId);


    var galleryPath = "public" + req.body.galleryPath;
    var actualSizePath = "public" + convertToActualSize(req.body.galleryPath);
    var thumbnailPath = "public" + convertToThumbnail(req.body.galleryPath);

    var staticThumbPath = convertToThumbnail(req.body.galleryPath);

    mongoose.model('Users').update(
        {
            "products.galleryImages._id": imageId
        },
        {
            $pull: {
                "products.$.galleryImages": {
                    "_id" : imageId
                },
                "products.$.thumbnailImages": staticThumbPath
            }
        }
        , function (err, result) {
            if (err) {
                console.log(err);
            }
            console.log("Deleted image from db: " + staticThumbPath);
            console.log("Deleted image from db: " + req.body.galleryPath);
            res.json(result);
        }
    );

    fs.remove(actualSizePath, function(err){
        if (err){
            console.error(err);
            res.status(500).send(err.message);
        }
        else{
            console.log("Removed images from " + actualSizePath);
        }
    });

    fs.remove(galleryPath, function(err){
        if (err){
            console.error(err);
            res.status(500).send(err.message);
        }
        else{
            console.log("Removed images from " + galleryPath);
        }
    });

    fs.remove(thumbnailPath, function(err){
        if (err){
            console.error(err);
            res.status(500).send(err.message);
        }
        else{
            console.log("Removed images from " + thumbnailPath);
        }
    });

    function convertToActualSize(gallery) {
        var galleryPath = "/images/gallery";
        return gallery.replace(galleryPath, "/images/actual-size");
    }

    function convertToThumbnail(gallery) {
        var galleryPath = "/images/gallery";
        return gallery.replace(galleryPath, "/images/thumbnails");
    }
});



app.post('/api/upload', function (req, res) {
    var busDeferred = Q.defer();
    var fsDeferred = Q.defer();


    var fstream;
    var busboy = new Busboy({ headers: req.headers });
    req.pipe(busboy);

    busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated) {
        if (fieldname == "myModel") {
//            console.log('Field [' + fieldname + ']: value: ' + val);
            busboy.on('file', function (fieldname, file, filename) {
                var parsedModel = JSON.parse(val);
//                var path = __dirname + '/files/' + parsedModel.username + "/" + parsedModel.productId + "/" + filename;
                var path = 'public/images/actual-size/' + parsedModel.username + "/" + parsedModel.productId + "/" + filename;

                async.waterfall([
                    function(callback){
                        var newPath = path;
                        var newFilename = filename;
                        function renameDuplicate(path, filename){
                            fs.exists(path, function(exists) {
                                if (exists) {
                                    console.log('File exists');
                                    newFilename = "Copy - " + filename;

                                    newPath = 'public/images/actual-size/' + parsedModel.username + "/" +
                                        parsedModel.productId + "/" + newFilename;

                                    renameDuplicate(newPath, newFilename);

                                } else {
                                    callback(null, newPath, newFilename);
                                }
                            });
                        }

                        renameDuplicate(newPath, newFilename);
                    },
                    function(path, filename){
                        fs.ensureFileSync(path);
//                console.log("Saving: " + filename);
                        fstream = fs.createWriteStream(path);
                        console.log("Saved: " + filename);
                        file.pipe(fstream);

                        fstream.on("finish", function () {
                            fsDeferred.resolve([path, parsedModel, filename]);
                        })
                    }
                ],
                function(err){
                    console.log(err);
                    res.status(err.code).send(err.message);
                })




            });
        }
    });

    fsDeferred.promise.then(function (args) {
        var path = args[0];
        var productId = args[1].productId;
        var username = args[1].username;
        var imageDescription = args[1].imageDescription;
        var filename = args[2];
//        busboy.on('finish', function () {

//            var thumbPath = __dirname + '/thumbnails/' + username + "/" + productId + "/" + filename;
        var galleryImagePath = 'public/images/gallery/' + username + "/" + productId + "/" + filename;
        var thumbPath = 'public/images/thumbnails/' + username + "/" + productId + "/" + filename;

        async.waterfall([
            function (callback) {
                fs.ensureFileSync(galleryImagePath);
                im.resize({
                    srcPath: path,
                    dstPath: galleryImagePath,
                    width: "620!",
                    height: "465!"
                }, function (err, stdout, stderr) {
                    console.log('resized image to gallery size 620x465px');
                    callback(err);
                });
            },
            function (callback) {
                fs.ensureFileSync(thumbPath);
                im.resize({
                    srcPath: path,
                    dstPath: thumbPath,
                    width: 200,
                    height: 150
                }, function (err, stdout, stderr) {
                    console.log('resized image to thumbnail size 200x150px');
                    callback(err);
                });
            },
            function (callback) {
                //            var staticPath = path.substring(path.indexOf("/"), path.length);
                var staticThumbPath = thumbPath.substring(thumbPath.indexOf("/"), thumbPath.length);
                var staticGalleryPath = galleryImagePath.substring(galleryImagePath.indexOf("/"), galleryImagePath.length);

                console.log("Thumbnail path: " + staticThumbPath);
                console.log("Image Description: " + imageDescription);
                var imageObject = {path: staticGalleryPath, imageDescription: imageDescription}

                mongoose.model('Users').update(
                    {
                        "products._id": productId

                    },
                    {
                        $addToSet: {
                            "products.$.galleryImages": imageObject,
                            "products.$.thumbnailImages": staticThumbPath
                        }
                        /*,
                        $set: {
                            "products.$.primaryImage": staticThumbPath
                        }*/
                    }
                    , function (err, result) {
                        if (err) {
                            console.log(err);
                            return;
                        }
//                        console.log("Saved thumbnail path to database");
                        callback(err)
                    }
                )
            }
        ], function (err, result) {
            if (err) {
                console.log(err);
                res.status(500).send(err.message);
            }
            else {
//                console.log("Done upload!");
                res.writeHead(200, { 'Connection': 'close' });
                res.end("That's all folks!");
            }
        })
//        });
    })
});

app.post('/api/primary_image', function (req, res) {
    var primaryImage = '/images/thumbnails/' + req.body.user.username + "/" + req.body._id + "/" + req.body.primaryImage;
    mongoose.model('Users').update(
        {
            "products._id": req.body._id

        },
        {
            $set: {
                "products.$.primaryImage": primaryImage
            }
        }
        , function (err, result) {
            if (err) {
                console.log(err);
                res.status(500).send(err.message);
            }
            else{
                console.log("Saved primary image " + primaryImage);
                res.end("Done saving primary image");
            }
        }
    )
});

app.get('/:username/products', function (req, res) {
    console.log("Getting products of " + req.params.username);
    mongoose.model('Users').findOne(
        {
            username: req.params.username
        },
        {
            products: 1
        },
        function (err, data) {
            if (err) return console.error(err);
//            console.log(data);
            res.json(data);
        })
});

var schemas = require('./db/schemas.js');
var User = new schemas.getUserModel();
require('./routes/products-rest.js')(app);



/*
 require('./routes/db')

 app.use(logger('combined')); //replaces your app.use(express.logger());
 app.get('/api/:name', function(req, res) {
 res.json(200, { "hello": req.params.name });
 });
 */

var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("ready kapitan!");
});
