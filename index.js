const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

//Create Redis Client
let client = redis.createClient();
(async () => {
    await client.connect();
    console.log('Connected to Redis....');
})();

client.on('connect', function () {
    console.log('Connected to Redis....');
});
//Set Port
const port = 3000;

//Init app
const app = express();

//View Engine
app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

//Method Override
app.use(methodOverride('_method'));

//Search User
app.get('/', function (req, res, next) {
    res.render('searchusers');
});

// Search processing
app.post('/user/search', async function (req, res, next) {
    let id = req.body.id;
    try {
        const obj = await client.hGetAll(id);
        if (!obj || Object.keys(obj).length === 0) {
            res.render('searchusers', {
                error: 'User does not exist'
            });
        } else {
            obj.id = id;
            res.render('details', {
                user: obj
            });
        }
    } catch (err) {
        console.error(err);
        res.render('searchusers', {
            error: 'Error in searching for user'
        });
    }
});


//Add User Page
app.get('/user/add', function (req, res, next) {
    res.render('adduser');
});

//Process Add User Page
app.post('/user/add', async function (req, res, next) {
    let id = req.body.id;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;
    let phone = req.body.phone;

    try {
        // Using hSet with an object for the field-value pairs
        const reply = await client.hSet(id, {
            'first_name': first_name,
            'last_name': last_name,
            'email': email,
            'phone': phone
        });
        console.log(reply);
        res.redirect('/');
    } catch (err) {
        console.log(err);
        res.status(500).send("Error while adding user");
    }
});


//Delete User
app.delete('/user/delete/:id', function(req, res, next){
    client.del(req.params.id);
    res.redirect('/');
});
//Start Server
app.listen(port, function () {
    console.log('Server Started on' + port);
});