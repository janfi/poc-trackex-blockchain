const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');

// capture network variables from config.json
const configPath = path.join(process.cwd(), 'config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);
var connection_file = config.connection_file;
var appAdmin = config.appAdmin;
var orgMSPID = config.orgMSPID;
var gatewayDiscovery = config.gatewayDiscovery;

const ccpPath = path.join(process.cwd(), connection_file);
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//export module
module.exports = {

  /*
  * Create Member participant and import card for identity
  * @param {String} cardId Import card id for member
  * @param {String} accountNumber Member account number as identifier on network
  * @param {String} firstName Member first name
  * @param {String} lastName Member last name
  * @param {String} phoneNumber Member phone number
  * @param {String} email Member email
  */
 registerMember: async function (cardId, accountNumber, firstName, lastName, email, phoneNumber) {

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), '/wallet');
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    try {

      var response = {};


      // Check to see if we've already enrolled the user.
      const userExists = await wallet.exists(cardId);
      if (userExists) {
        var err = `An identity for the user ${cardId} already exists in the wallet`;
        console.log(err);
        response.error = err;
        return response;
      }

      // Check to see if we've already enrolled the admin user.
      const adminExists = await wallet.exists(appAdmin);
      if (!adminExists) {
        var err = `An identity for the admin user-admin does not exist in the wallet. Run the enrollAdmin.js application before retrying`;
        console.log(err);
        response.error = err;
        return response;
      }

      // Create a new gateway for connecting to our peer node.
      const gateway = new Gateway();
      await gateway.connect(ccp, { wallet, identity: appAdmin, discovery: gatewayDiscovery });

      // Get the CA client object from the gateway for interacting with the CA.
      const ca = gateway.getClient().getCertificateAuthority();
      const adminIdentity = gateway.getCurrentIdentity();

      // Register the user, enroll the user, and import the new identity into the wallet.
      const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: cardId, role: 'client' }, adminIdentity);
      const enrollment = await ca.enroll({ enrollmentID: cardId, enrollmentSecret: secret });
      const userIdentity = X509WalletMixin.createIdentity(orgMSPID, enrollment.certificate, enrollment.key.toBytes());
      wallet.import(cardId, userIdentity);
      console.log('Successfully registered and enrolled admin user ' + cardId + ' and imported it into the wallet');
    
      // Disconnect from the gateway.
      await gateway.disconnect();
      console.log('admin user admin disconnected');

    } catch (err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }

    await sleep(2000);

    try {
      // Create a new gateway for connecting to our peer node.
      const gateway2 = new Gateway();
      await gateway2.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });

      // Get the network (channel) our contract is deployed to.
      const network = await gateway2.getNetwork('mychannel');

      // Get the contract from the network.
      const contract = network.getContract('trackexechange');
      
      let member = {};
      member.accountNumber = accountNumber;
      member.firstName = firstName;
      member.lastName = lastName;
      member.email = email;
      member.phoneNumber = phoneNumber;
      member.points = 0;

      // Submit the specified transaction.
      console.log('\nSubmit Create Member transaction.');
      const createMemberResponse = await contract.submitTransaction('CreateMember', JSON.stringify(member));
      console.log('createMemberResponse: ');
      console.log(JSON.parse(createMemberResponse.toString()));

      console.log('\nGet member state ');
      const memberResponse = await contract.evaluateTransaction('GetState', accountNumber);
      console.log('memberResponse.parse_response: ')
      console.log(JSON.parse(JSON.parse(memberResponse.toString())));

      // Disconnect from the gateway.
      await gateway2.disconnect();

      return true;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }

  },

  /*
  * Create Partner participant and import card for identity
  * @param {String} cardId Import card id for partner
  * @param {String} partnerId Partner Id as identifier on network
  * @param {String} name Partner name
  */
  registerPartner: async function (cardId, partnerId, name) {

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), '/wallet');
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);
    
    try {

      var response = {};


      // Check to see if we've already enrolled the user.
      const userExists = await wallet.exists(cardId);
      if (userExists) {
        var err = `L'ID ${cardId} existe déjà sur le réseau`;
        console.log(err);
        response.error = err;
        return response;
      }

      // Check to see if we've already enrolled the admin user.
      const adminExists = await wallet.exists(appAdmin);
      if (!adminExists) {
        var err = `Un administrateur de réseau est requis.`;
        console.log(err);
        response.error = err;
        return response;
      }

      // Create a new gateway for connecting to our peer node.
      const gateway = new Gateway();
      await gateway.connect(ccp, { wallet, identity: appAdmin, discovery: gatewayDiscovery });

      // Get the CA client object from the gateway for interacting with the CA.
      const ca = gateway.getClient().getCertificateAuthority();
      const adminIdentity = gateway.getCurrentIdentity();

      // Register the user, enroll the user, and import the new identity into the wallet.
      const secret = await ca.register({ affiliation: 'org1', enrollmentID: cardId, role: 'client' }, adminIdentity);
      const enrollment = await ca.enroll({ enrollmentID: cardId, enrollmentSecret: secret });
      const userIdentity = X509WalletMixin.createIdentity(orgMSPID, enrollment.certificate, enrollment.key.toBytes());
      wallet.import(cardId, userIdentity);
      console.log('Successfully registered and enrolled admin user ' + cardId + ' and imported it into the wallet');
    
      // Disconnect from the gateway.
      await gateway.disconnect();
      console.log('admin user admin disconnected');

    } catch (err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }

    await sleep(2000);
    
    try {
      // Create a new gateway for connecting to our peer node.
      const gateway2 = new Gateway();
      await gateway2.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });

      // Get the network (channel) our contract is deployed to.
      const network = await gateway2.getNetwork('mychannel');

      // Get the contract from the network.
      const contract = network.getContract('trackexechange');
      
      let partner = {};
      partner.id = partnerId;
      partner.name = name;

      // Submit the specified transaction.
      console.log('\nSubmit Create Partner transaction.');
      const createPartnerResponse = await contract.submitTransaction('CreatePartner', JSON.stringify(partner));
      console.log('createPartnerResponse: ');
      console.log(JSON.parse(createPartnerResponse.toString()));

      console.log('\nGet partner state ');
      const partnerResponse = await contract.evaluateTransaction('GetState', partnerId);
      console.log('partnerResponse.parse_response: ')
      console.log(JSON.parse(JSON.parse(partnerResponse.toString())));

      // Disconnect from the gateway.
      await gateway2.disconnect();

      return true;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }

  },

  /*
  * Create Partner participant and import card for identity
  * @param {String} cardId Import card id for partner
  * @param {String} partnerId Partner Id as identifier on network
  * @param {String} name Partner name
  */
 registerProduct: async function (cardId, partnerId, productId, name, prix) {
    const walletPath = path.join(process.cwd(), '/wallet');
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);
    try {
      // Create a new gateway for connecting to our peer node.
      const gateway2 = new Gateway();
      await gateway2.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });

      // Get the network (channel) our contract is deployed to.
      const network = await gateway2.getNetwork('mychannel');

      // Get the contract from the network.
      const contract = network.getContract('trackexechange');
      
      let product = {};
      product.id = productId;
      product.name = name;
      product.prix = prix;
      product.partner = partnerId;

      // Submit the specified transaction.
      console.log('\nSubmit Product creation.');
      const addProductResponse = await contract.submitTransaction('addProduct', JSON.stringify(product));
      console.log('addProductResponse: ');
      console.log(JSON.parse(addProductResponse.toString()));

      // Disconnect from the gateway.
      await gateway2.disconnect();

      return true;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }
 },
 buyProduct: async function (accountNumber, cardId, partnerId, productId) {
  const walletPath = path.join(process.cwd(), '/wallet');
  const wallet = new FileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);
  try {
    // Create a new gateway for connecting to our peer node.
    const gateway2 = new Gateway();
    await gateway2.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway2.getNetwork('mychannel');

    // Get the contract from the network.
    const contract = network.getContract('trackexechange');
    
    let buyProduct = {};
    buyProduct.accountNumber = accountNumber;
    buyProduct.partnerId = partnerId;
    buyProduct.productId = productId;

    // Submit the specified transaction.
    console.log('\nSubmit Product achat.');
    const buyProductResponse = await contract.submitTransaction('buyProduct', JSON.stringify(buyProduct));
    console.log('buyProductResponse: ');
    console.log(JSON.parse(buyProductResponse.toString()));

    // Disconnect from the gateway.
    await gateway2.disconnect();

    return true;
  }
  catch(err) {
    //print and return error
    console.log(err);
    var error = {};
    error.error = err.message;
    return error;
  }
},
buyAchat: async function (cardId, partnerId, transactionId, accountNumber) {

  const walletPath = path.join(process.cwd(), '/wallet');
  const wallet = new FileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);

  try {
    // Create a new gateway for connecting to our peer node.
    const gateway2 = new Gateway();
    await gateway2.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway2.getNetwork('mychannel');

    // Get the contract from the network.
    const contract = network.getContract('trackexechange');
    
    let buyAchat = {};
    buyAchat.partnerId = partnerId;
    buyAchat.transactionId = transactionId;
    buyAchat.accountNumber = accountNumber;
    // Submit the specified transaction.
    console.log('\nSubmit Product achat.');
    const buyAchatResponse = await contract.submitTransaction('buyAchat', JSON.stringify(buyAchat));
    console.log('buyProductResponse: ');
    console.log(JSON.parse(buyAchatResponse.toString()));

    // Disconnect from the gateway.
    await gateway2.disconnect();

    return true;
  }
  catch(err) {
    //print and return error
    console.log(err);
    var error = {};
    error.error = err.message;
    return error;
  }
},
showAchats: async function (accountNumber, cardId) {

  const walletPath = path.join(process.cwd(), '/wallet');
  const wallet = new FileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);

  try {
    // Create a new gateway for connecting to our peer node.
    const gateway2 = new Gateway();
    await gateway2.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway2.getNetwork('mychannel');

    // Get the contract from the network.
    const contract = network.getContract('trackexechange');

    // Submit the specified transaction.
    let lstAchatsResponse = await contract.submitTransaction('GetState', 'all-members-achats');
    lstAchatsResponse = JSON.parse(JSON.parse(lstAchatsResponse.toString()));
    console.log('lstAchatsResponse: ');
    console.log(lstAchatsResponse[accountNumber]);

    // Disconnect from the gateway.
    await gateway2.disconnect();

    return lstAchatsResponse[accountNumber];
  }
  catch(err) {
    //print and return error
    console.log(err);
    var error = {};
    error.error = err.message;
    return error;
  }
},
showAchatsPartner: async function (partnerId, cardId) {

  const walletPath = path.join(process.cwd(), '/wallet');
  const wallet = new FileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);

  try {
    // Create a new gateway for connecting to our peer node.
    const gateway2 = new Gateway();
    await gateway2.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway2.getNetwork('mychannel');

    // Get the contract from the network.
    const contract = network.getContract('trackexechange');
    
    // Submit the specified transaction.
    let lstAchatsResponse = await contract.submitTransaction('GetState', 'all-partners-achats-dispo');
    lstAchatsResponse = JSON.parse(JSON.parse(lstAchatsResponse.toString()));
    console.log('lstAchatsResponse: ');
    console.log(lstAchatsResponse[partnerId]);

    // Disconnect from the gateway.
    await gateway2.disconnect();

    return lstAchatsResponse[partnerId];
  }
  catch(err) {
    //print and return error
    console.log(err);
    var error = {};
    error.error = err.message;
    return error;
  }
},
showAchatsPartnerUse: async function (partnerId, cardId) {

  const walletPath = path.join(process.cwd(), '/wallet');
  const wallet = new FileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);

  try {
    // Create a new gateway for connecting to our peer node.
    const gateway2 = new Gateway();
    await gateway2.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway2.getNetwork('mychannel');

    // Get the contract from the network.
    const contract = network.getContract('trackexechange');
    
    // Submit the specified transaction.
    let lstAchatsResponse = await contract.submitTransaction('GetState', 'all-partners-achats-use');
    lstAchatsResponse = JSON.parse(JSON.parse(lstAchatsResponse.toString()));
    console.log('lstAchatsResponse: ');
    console.log(lstAchatsResponse[partnerId]);

    // Disconnect from the gateway.
    await gateway2.disconnect();

    return lstAchatsResponse[partnerId] ? lstAchatsResponse[partnerId] : [];
  }
  catch(err) {
    //print and return error
    console.log(err);
    var error = {};
    error.error = err.message;
    return error;
  }
},
  
  /*
  * Get Member data
  * @param {String} cardId Card id to connect to network
  * @param {String} accountNumber Account number of member
  */
  memberData: async function (cardId, accountNumber) {

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), '/wallet');
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    try {
      // Create a new gateway for connecting to our peer node.
      const gateway2 = new Gateway();
      await gateway2.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });

      // Get the network (channel) our contract is deployed to.
      const network = await gateway2.getNetwork('mychannel');

      // Get the contract from the network.
      const contract = network.getContract('trackexechange');

      console.log('\nGet member state ');
      let member = await contract.submitTransaction('GetState', accountNumber);
      member = JSON.parse(JSON.parse(member.toString()));
      console.log(member);

      // Disconnect from the gateway.
      await gateway2.disconnect();

      return member;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }

  },

  /*
  * Get Partner data
  * @param {String} cardId Card id to connect to network
  * @param {String} partnerId Partner Id of partner
  */
  partnerData: async function (cardId, partnerId) {

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), '/wallet');
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    try {
      // Create a new gateway for connecting to our peer node.
      const gateway2 = new Gateway();
      await gateway2.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });

      // Get the network (channel) our contract is deployed to.
      const network = await gateway2.getNetwork('mychannel');

      // Get the contract from the network.
      const contract = network.getContract('trackexechange');

      console.log('\nGet partner state ');
      let partner = await contract.submitTransaction('GetState', partnerId);
      partner = JSON.parse(JSON.parse(partner.toString()));
      console.log(partner);

      // Disconnect from the gateway.
      await gateway2.disconnect();

      return partner;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error
    }

  },

  /*
  * Get all partners data
  * @param {String} cardId Card id to connect to network
  */
 allListProductsInfo : async function (cardId, partnerId) {

  // Create a new file system based wallet for managing identities.
  const walletPath = path.join(process.cwd(), '/wallet');
  const wallet = new FileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);

  try {
    // Create a new gateway for connecting to our peer node.
    const gateway2 = new Gateway();
    await gateway2.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway2.getNetwork('mychannel');

    // Get the contract from the network.
    const contract = network.getContract('trackexechange');

    console.log('\nGet all partners products ');
    let allPartnersProducts = await contract.evaluateTransaction('GetState', 'all-partners-products');
    allPartnersProducts = JSON.parse(JSON.parse(allPartnersProducts.toString()));

    console.log(allPartnersProducts[partnerId]);

    // Disconnect from the gateway.
    await gateway2.disconnect();

    return allPartnersProducts[partnerId];
  }
  catch(err) {
    //print and return error
    console.log(err);
    var error = {};
    error.error = err.message;
    return error
  }
},

  /*
  * Get all partners data
  * @param {String} cardId Card id to connect to network
  */
  allPartnersInfo : async function (cardId) {

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), '/wallet');
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    try {
      // Create a new gateway for connecting to our peer node.
      const gateway2 = new Gateway();
      await gateway2.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });

      // Get the network (channel) our contract is deployed to.
      const network = await gateway2.getNetwork('mychannel');

      // Get the contract from the network.
      const contract = network.getContract('trackexechange');

      console.log('\nGet all partners state ');
      let allPartners = await contract.evaluateTransaction('GetState', 'all-partners');
      allPartners = JSON.parse(JSON.parse(allPartners.toString()));
      console.log(allPartners);

      // Disconnect from the gateway.
      await gateway2.disconnect();

      return allPartners;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error
    }
  }

}
