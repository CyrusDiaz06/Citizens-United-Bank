// Modules
var express = require('express');
var path = require('path'); 
var app = express();
const DBControl = require('./DBControl');
const bodyParser = require('body-parser');
const Utils = require('./Utilities');

// Settings
const port = 3000
var userID = 0
// random stuff that helps the server accept methods from client
app.use(express.static('public'));  
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	res.setHeader('Access-Control-Allow-Credentials', true);
	next();
});

//app.get listens to get requests, which is like when you go to google.com you do a get request for their page
//so this listens to get requests to localhost:8000 and will execute this function if someone goes there
// this is what executes when you go to localhost:3000, just defaults to the html file

// screen managers
app.get('/', function(req, res){ 
    var options = { 
        root: path.join(__dirname) 
    }; 
    var fileName = 'index.html';  // this is the default page
    res.sendFile(fileName, options, function (err) { 
        if (err) { 
            next(err); 
        } else { 
            console.log('File: ', fileName, ' has been sent'); 
        } 
    }); 
}); 



// get/post requests

app.post('/deposit', function (req, res) { 
    const body = req.body; // this is the parameters sent from client
	console.log("Deposit request... Amount: "+body.amount+", Account Number: "+body.act_num)
	if (!Utils.isNumber(req.body.amount)) {
		res.send("Please enter a number"); // this is what we send back to the client once we're done
		return;
	}
	DBControl.deposit(body.amount, body.act_num, res)
	const amount = +body.amount
});

app.post('/withdraw', function (req, res) { 
    const body = req.body; // this is the parameters sent from client
	console.log("Withdraw request... Amount: "+body.amount+", Account Number: "+body.act_num)
	if (!Utils.isNumber(req.body.amount)) {
		res.send("Please enter a number"); // this is what we send back to the client once we're done
		return;
	}
	DBControl.withdraw(body.amount, body.act_num, res)
	const amount = +body.amount
});

app.post('/transfer', function (req, res) { 
	console.log("Transfer request")
    const body = req.body; // this is the parameters sent from client
	const userid = Utils.getUserID(body.userid)
	const act1 = body.act1
	const act2 = body.act2
	const amount = body.amount
	DBControl.transfer(amount, act1, act2, res)
});

app.post('/addaccount', async function (req, res) { 
	console.log("Request to add account")
    const body = req.body; 
	const userid = Utils.getUserID(body.userid)
	DBControl.addAccount(userid, res)
});

app.post('/adduser', async function (req, res) { 
	console.log("Request to add user")
    const body = req.body; 
	const userid = Utils.getUserID(body.userid)
	const dob = body.dob
	const phone = body.phone
	DBControl.addUser(userid, dob, phone, res)
	//res.send('done')
});

app.post('/getAccounts', async function (req, res) { 
	
    const body = req.body; // this is the parameters sent from client
	const userid = Utils.getUserID(body.userid)
	console.log("Request to get accounts of user ID: "+userid)
	DBControl.getAccounts(userid, res)
});

app.post('/getTransactions', async function (req, res) { 
	
    const body = req.body; // this is the parameters sent from client
	const userid = Utils.getUserID(body.userid)
	console.log("Request to get transactions of user ID: "+userid)
	DBControl.getTransactions(userid, res)
});

app.post('/totalBalance', async function (req, res) { 
	
    const body = req.body; // this is the parameters sent from client
	const userid = Utils.getUserID(body.userid)
	console.log("Request to get total balance of: "+userid)
	DBControl.getTotalBalance(userid, res)
});

app.post('/viewAll', async function (req, res) { 
	
    const body = req.body; // this is the parameters sent from client
	DBControl.viewAll(res)
});

var server = app.listen(port, function () { // starts the server on the localhost/port
   var host = server.address().address
   var port = server.address().port
   
   console.log("Citzen United Bank listening at http://%s:%s", host, port)
})
