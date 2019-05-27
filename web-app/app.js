'use strict';

//get libraries
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path')

//create express web-app
const app = express();
const router = express.Router();

//get the libraries to call
var network = require('./network/network.js');
var validate = require('./network/validate.js');
var analysis = require('./network/analysis.js');

//bootstrap application settings
app.use(express.static('./public'));
app.use('/scripts', express.static(path.join(__dirname, '/public/scripts')));
app.use(bodyParser.json());

//get home page
app.get('/home', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

//get member page
app.get('/member', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/member.html'));
});

//get member registration page
app.get('/registerMember', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/registerMember.html'));
});

//get partner page
app.get('/partner', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/partner.html'));
});

//get partner registration page
app.get('/registerPartner', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/registerPartner.html'));
});

//get about page
app.get('/about', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/about.html'));
});


//post call to register member on the network
app.post('/api/registerMember', function(req, res) {

  //declare variables to retrieve from request
  var accountNumber = req.body.accountnumber;
  var cardId = req.body.cardid;
  var firstName = req.body.firstname;
  var lastName = req.body.lastname;
  var email = req.body.email;
  var phoneNumber = req.body.phonenumber;

  //print variables
  console.log('Using param - firstname: ' + firstName + ' lastname: ' + lastName + ' email: ' + email + ' phonenumber: ' + phoneNumber + ' accountNumber: ' + accountNumber + ' cardId: ' + cardId);

  //validate member registration fields
  validate.validateMemberRegistration(cardId, accountNumber, firstName, lastName, email, phoneNumber)
    .then((response) => {
      //return error if error in response
      if (response.error != null) {
        res.json({
          error: response.error
        });
        return;
      } else {
        //else register member on the network
        network.registerMember(cardId, accountNumber, firstName, lastName, email, phoneNumber)
          .then((response) => {
            //return error if error in response
            if (response.error != null) {
              res.json({
                error: response.error
              });
            } else {
              //else return success
              res.json({
                success: response
              });
            }
          });
      }
    });
});

//post call to register partner on the network
app.post('/api/registerPartner', function(req, res) {

  //declare variables to retrieve from request
  var name = req.body.name;
  var partnerId = req.body.partnerid;
  var cardId = req.body.cardid;

  //print variables
  console.log('Using param - name: ' + name + ' partnerId: ' + partnerId + ' cardId: ' + cardId);

  //validate partner registration fields
  validate.validatePartnerRegistration(cardId, partnerId, name)
    .then((response) => {
      //return error if error in response
      if (response.error != null) {
        res.json({
          error: response.error
        });
        return;
      } else {
        //else register partner on the network
        network.registerPartner(cardId, partnerId, name)
          .then((response) => {
            //return error if error in response
            if (response.error != null) {
              res.json({
                error: response.error
              });
            } else {
              //else return success
              res.json({
                success: response
              });
            }
          });
      }
    });
});

//post call to register partner on the network
app.post('/api/registerProduct', function(req, res) {

  //declare variables to retrieve from request
  var name = req.body.name;
  var prix = req.body.prix;
  var productid = req.body.productid;
  var partnerid = req.body.partnerid;
  var cardid = req.body.cardid;
  //print variables
  console.log('Using param - name: ' + name + ' prix: ' + prix + ' partnerId: ' + partnerid + ' productid: ' + productid);

  //validate partner registration fields
  validate.validateProductsRegistration(partnerid, productid, name, prix)
    .then((response) => {
      //return error if error in response
      if (response.error != null) {
        res.json({
          error: response.error
        });
        return;
      } else {
        //else register partner on the network
        network.registerProduct(cardid, partnerid, productid, name, prix)
          .then((response) => {
            //return error if error in response
            if (response.error != null) {
              res.json({
                error: response.error
              });
            } else {
              network.allListProductsInfo(cardid, partnerid)
              .then((listProductsResult) => {
                //return error if error in response
                if (listProductsResult.error != null) {
                  res.json({
                    error: listProductsResult.error
                  });
                } else {
                  res.json({
                    success: response,
                    listProduct:listProductsResult
                  });
                }
  
              })
              
            }
          });
      }
    });
});

//post call to retrieve member data, transactions data and partners to perform transactions with from the network
app.post('/api/memberData', function(req, res) {

  //declare variables to retrieve from request
  var accountNumber = req.body.accountnumber;
  var cardId = req.body.cardid;

  //print variables
  console.log('memberData using param - ' + ' accountNumber: ' + accountNumber + ' cardId: ' + cardId);

  //declare return object
  var returnData = {};

  //get member data from network
  network.memberData(cardId, accountNumber)
    .then((member) => {
      //return error if error in response
      if (member.error != null) {
        res.json({
          error: member.error
        });
      } else {
        //else add member data to return object
        returnData.accountNumber = member.accountNumber;
        returnData.firstName = member.firstName;
        returnData.lastName = member.lastName;
        returnData.phoneNumber = member.phoneNumber;
        returnData.email = member.email;
        returnData.points = member.points;
      }

    })
    .then(() => {
      network.allPartnersInfo(cardId)
              .then((partnersInfo) => {
                //return error if error in response
                if (partnersInfo.error != null) {
                  res.json({
                    error: partnersInfo.error
                  });
                } else {
                  //else add partners data to return object
                  returnData.partnersData = partnersInfo;
                }

                //return returnData
                res.json(returnData);

              });

    });

});

//post call to retrieve partner data and transactions data from the network
app.post('/api/listProductsInfo', function(req, res) {

  //declare variables to retrieve from request
  var partnerId = req.body.partnerid;
  var cardId = req.body.cardid;

  //declare return object
  var returnData = {};

  network.allListProductsInfo(cardId, partnerId)
    .then((listProductsResult) => {
      //return error if error in response
      if (listProductsResult.error != null) {
        res.json({
          error: listProductsResult.error
        });
      } else {
        returnData.listProduct = listProductsResult;
      }
      //return returnData
      res.json(returnData);
    })
});

app.post('/api/buyProduct', function(req, res) {

  //declare variables to retrieve from request
  var partnerId = req.body.partnerid;
  var cardId = req.body.cardid;
  var productId = req.body.productid;
  var accountNumber = req.body.accountnumber;

  //declare return object
  var returnData = {};
  
  network.buyProduct(accountNumber, cardId, partnerId,productId)
    .then((listProductsResult) => {
      //return error if error in response
      if (listProductsResult.error != null) {
        res.json({
          error: listProductsResult.error
        });
      } else {
        returnData.success = true;
      }
      //return returnData
      res.json(returnData);
    })
});

app.post('/api/buyAchat', function(req, res) {

  //declare variables to retrieve from request
  var partnerId = req.body.partnerid;
  var cardId = req.body.cardid;
  var transactionId = req.body.transactionid;
  var accountNumber = req.body.accountnumber;

  //declare return object
  var returnData = {};
  
  network.buyAchat(cardId, partnerId, transactionId, accountNumber)
    .then((buyAchatResult) => {
      //return error if error in response
      if (buyAchatResult.error != null) {
        res.json({
          error: buyAchatResult.error
        });
      } else {
        returnData.success = true;
      }
      //return returnData
      res.json(returnData);
    })
});

app.post('/api/showAchats', function(req, res) {

  //declare variables to retrieve from request
  var cardId = req.body.cardid;
  var accountNumber = req.body.accountnumber;

  //declare return object
  var returnData = {};
  
  network.showAchats(accountNumber, cardId)
    .then((listAchatsResult) => {
      //return error if error in response
      if (listAchatsResult.error != null) {
        res.json({
          error: listAchatsResult.error
        });
      } else {
        returnData.listAchats = listAchatsResult;
      }
      //return returnData
      res.json(returnData);
    })
});

app.post('/api/showAchatsPartner', function(req, res) {

  //declare variables to retrieve from request
  var cardId = req.body.cardid;
  var partnerId = req.body.partnerid;

  //declare return object
  var returnData = {};
  
  network.showAchatsPartner(partnerId, cardId)
    .then((listAchatsResult) => {
      //return error if error in response
      if (listAchatsResult.error != null) {
        res.json({
          error: listAchatsResult.error
        });
      } else {
        returnData.listAchats = listAchatsResult;
      }
      //return returnData
      res.json(returnData);
    })
});

app.post('/api/showAchatsPartnerUse', function(req, res) {

  //declare variables to retrieve from request
  var cardId = req.body.cardid;
  var partnerId = req.body.partnerid;

  //declare return object
  var returnData = {};
  
  network.showAchatsPartnerUse(partnerId, cardId)
    .then((listAchatsResult) => {
      //return error if error in response
      if (listAchatsResult.error != null) {
        res.json({
          error: listAchatsResult.error
        });
      } else {
        returnData.listAchats = listAchatsResult;
      }
      //return returnData
      res.json(returnData);
    })
});

//post call to retrieve partner data and transactions data from the network
app.post('/api/partnerData', function(req, res) {

  //declare variables to retrieve from request
  var partnerId = req.body.partnerid;
  var cardId = req.body.cardid;

  //print variables
  console.log('partnerData using param - ' + ' partnerId: ' + partnerId + ' cardId: ' + cardId);

  //declare return object
  var returnData = {};

  //get partner data from network
  network.partnerData(cardId, partnerId)
    .then((partner) => {
      //return error if error in response
      if (partner.error != null) {
        res.json({
          error: partner.error
        });
      } else {
        //else add partner data to return object
        returnData.id = partner.id;
        returnData.name = partner.name;
      }

    })
    .then(() => {
      network.allListProductsInfo(cardId, partnerId)
              .then((listProductsResult) => {
                //return error if error in response
                if (listProductsResult.error != null) {
                  res.json({
                    error: listProductsResult.error
                  });
                } else {
                  returnData.listProduct = listProductsResult;
                }
                //return returnData
                res.json(returnData);
              })
    });

});

//declare port
var port = process.env.PORT || 8000;
if (process.env.VCAP_APPLICATION) {
  port = process.env.PORT;
}

//run app on port
app.listen(port, function() {
  console.log('app running on port: %d', port);
});
