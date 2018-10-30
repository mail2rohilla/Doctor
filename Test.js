const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var bodyParser = require('body-parser');

const express = require('express');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// to allow cors
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
// app.use(express.static('HTML'));
// app.get('/', function(req, res){res.sendFile("/Test.html")});
app.get('/', function(req, res){console.log("listening on 3000")});

const url = 'mongodb://localhost:27017';
const dbName = 'doctor';
app.get('/getDrugList', urlencodedParser, function(req, res){
    var obj;

    MongoClient.connect(url,  { useNewUrlParser: true }, function(err, client) {
        assert.equal(null, err);
        if(err)
            console.log("try starting the db server");

        const db = client.db("doctor");
        console.log("finding drugs");
        const druglist = db.collection("drug").find().toArray(function(err, result) {
            if (err)
                console.log(err);
            else
            {
                // console.log(result);
                client.close();
                res.send(result);
            }
        });
        // obj = druglist;
        // console.log(obj);
    });
    // res.send(obj);
});
app.get('/getPatientsList', urlencodedParser, function(req, res){
    var obj;

    MongoClient.connect(url,  { useNewUrlParser: true }, function(err, client) {
        assert.equal(null, err);
        if(err)
            console.log("try starting the db server /getPatients");

        const db = client.db("doctor");
        console.log("finding patients");
        const patientsList = db.collection("patients").find().toArray(function(err, result) {
            if (err)
                console.log(err);
            else
            {
                // console.log(result);
                client.close();
                res.send(result);
            }
        });
        // obj = druglist;
        // console.log(obj);
    });
    // res.send(obj);
});
app.get('/getPrescription', urlencodedParser, function(req, res){
    var obj;

    MongoClient.connect(url,  { useNewUrlParser: true }, function(err, client) {
        assert.equal(null, err);
        if(err)
            console.log("try starting the db server /getPatients");

        const db = client.db("doctor");
        console.log("finding patients");
        db.collection("prescription").find().toArray(function(err, result) {
            if (err)
                console.log(err);
            else
            {
                // console.log(result);
                client.close();
                res.send(result);
            }
        });
        // obj = druglist;
        // console.log(obj);
    });
    // res.send(obj);
});
app.get('/getAllDetails', urlencodedParser, function(req, res){
    MongoClient.connect(url, function(err, client) {
        if (err) throw err;
        var dbo = client.db("doctor");
        dbo.collection('patients').aggregate([
            { $lookup:
                {
                    from: 'druglist',
                    localField: 'pid',
                    foreignField: 'pid',
                    as: 'dateList'
                }
            }
        ]).toArray(function(err, result) {
            if (err) throw err;
            // console.log(JSON.stringify(res));
            client.close();
            res.send(result);
        });
    // res.send(obj);
    });
});
app.post('/addDrugDetails', urlencodedParser, function(req, res){
    MongoClient.connect(url, function(err, client) {
        assert.equal(null, err);
        if(err)
            console.log("try starting the db server");

        const db = client.db("doctor");
        var obj = req.body;

        // console.log(obj);

        db.collection("drug").insertOne(obj);
        client.close();
    });
    res.send("drug added");


});
app.post('/addPatientDetails', urlencodedParser, function(req, res){
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
        assert.equal(null, err);
        if(err)
            console.log("try starting the db server");

        const db = client.db("doctor");
        var obj = req.body;

        // console.log(obj);

        db.collection("patients").insertOne(obj);
        client.close();
        res.send(obj);
    });


});
app.post('/addDrugList', urlencodedParser, function(req, res){
    MongoClient.connect(url, function(err, client) {
        assert.equal(null, err);
        if(err)
            console.log("try starting the db server");

        //  arrays recieved from ajax queries are with deformed keys of objects
        //  key containg lists become 'key[]' rename so that when retrieved
        //  proper keys are recieved from DB
        var renameProperty =function (obj, fromKey, toKey) {
            obj[toKey] = obj[fromKey];
            delete obj[fromKey];
        };

        const db = client.db("doctor");
        var obj = req.body;

        renameProperty(obj, 'dlist[]', 'dlist');
        renameProperty(obj, 'plist[]', 'plist');

        //  array cotaining just 1 string is recieved as a string element,
        //  while required to store in array as when retrieved code written
        // is compatible to arrays
        if(!Array.isArray(obj["dlist"]))
            obj.dlist = [obj.dlist];
        if(!Array.isArray(obj["plist"]))
            obj.plist = [obj.plist];


        db.collection("druglist").insertOne(obj);
        client.close();
    });

    res.send("added patient details");

});
app.post('/addPrescription', urlencodedParser, function(req, res){
    MongoClient.connect(url, function(err, client) {
        assert.equal(null, err);
        if(err)
            console.log("try starting the db server");

        const db = client.db("doctor");
        var obj = req.body;

        // console.log(obj);

        db.collection("prescription").insertOne(obj);
        client.close();
    });

    res.send("added patient details");

});
app.listen(3000, function() {console.log('Example app listening on port 3000!')});