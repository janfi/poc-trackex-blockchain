module.exports = {

  /*
  * Validata member registration fields ensuring the fields meet the criteria
  * @param {String} cardId
  * @param {String} accountNumber
  * @param {String} firstName
  * @param {String} lastName
  * @param {String} phoneNumber
  * @param {String} email
  */
  validateMemberRegistration: async function(cardId, accountNumber, firstName, lastName, email, phoneNumber) {

    var response = {};

    //verify input otherwise return error with an informative message
    if (accountNumber.length < 6) {
      response.error = "Numéro de compte doit avoir au minimun 6 chiffres.";
      console.log(response.error);
      return response;
    } else if (!isInt(accountNumber)) {
      response.error = "Numéro de compte doit être composé que de nombres";
      console.log(response.error);
      return response;
    } else if (accountNumber.length > 25) {
      response.error = "ANuméro de compte doit avoir au maximum 25 chiffres.";
      console.log(response.error);
      return response;
    } else if (cardId.length < 1) {
      response.error = "ID access requis";
      console.log(response.error);
      return response;
    } else if (!/^[0-9a-zA-Z]+$/.test(cardId)) {
      response.error = "ID Access ne peut contenir que des lettres et des chiffres";
      console.log(response.error);
      return response;
    } else if (firstName.length < 1) {
      response.error = "Renseigner le prénom";
      console.log(response.error);
      return response;
    } else if (!/^[a-zA-Z]+$/.test(firstName)) {
      response.error = "Le prénom ne peut contenir que des lettres";
      console.log(response.error);
      return response;
    } else if (lastName.length < 1) {
      response.error = "Renseigner le nom";
      console.log(response.error);
      return response;
    } else if (!/^[a-zA-Z]+$/.test(lastName)) {
      response.error = "Le nom ne peut contenir que des lettres";
      console.log(response.error);
      return response;
    } else if (email.length < 1) {
      response.error = "Email requi";
      console.log(response.error);
      return response;
    } else if (!validateEmail(email)) {
      response.error = "Email doit être valide";
      console.log(response.error);
      return response;
    } else if (phoneNumber.length < 1) {
      response.error = "Numéro de téléphone requis";
      console.log(response.error);
      return response;
    } else if (!validatePhoneNumber(phoneNumber)) {
      response.error = "Numéro de téléphone doit être valide";
      console.log(response.error);
      return response;
    } else {
      console.log("Entrées valides");
      return response;
    }

  },

  /*
  * Validata partner registration fields ensuring the fields meet the criteria
  * @param {String} cardId
  * @param {String} partnerId
  * @param {String} name
  */
  validatePartnerRegistration: async function(cardId, partnerId, name) {

    var response = {};

    //verify input otherwise return error with an informative message
    if (cardId.length < 1) {
      response.error = "ID Access requis";
      console.log(response.error);
      return response;
    } else if (!/^[0-9a-zA-Z]+$/.test(cardId)) {
      response.error = "ID Access ne peut contenir que des lettres et des chiffres";
      console.log(response.error);
      return response;
    } else if (partnerId.length < 1) {
      response.error = "ID Partenaire requis";
      console.log(response.error);
      return response;
    } else if (!/^[0-9a-zA-Z]+$/.test(partnerId)) {
      response.error = "ID Partenaire ne peut contenir que des lettres et des chiffres";
      console.log(response.error);
      return response;
    } else if (name.length < 1) {
      response.error = "Renseigner le nom de la compagnie";
      console.log(response.error);
      return response;
    } else if (!/^[a-zA-Z]+$/.test(name)) {
      response.error = "Le nom de la compagnie ne peut contenir que des lettres";
      console.log(response.error);
      return response;
    } else {
      console.log("Entrées valides");
      return response;
    }

  },

  /*
  * Validata partner registration fields ensuring the fields meet the criteria
  * @param {String} cardId
  * @param {String} partnerId
  * @param {String} name
  */
 validateProductsRegistration: async function(partnerId, productId, name, prix) {

  var response = {};

  //verify input otherwise return error with an informative message
  if (productId.length < 1) {
    response.error = "Product Id requis";
    console.log(response.error);
    return response;
  } else if (!/^[0-9a-zA-Z]+$/.test(productId)) {
    response.error = "Product Id ne peut contenir que des lettres et des chiffres";
    console.log(response.error);
    return response;
  } else if (partnerId.length < 1) {
    response.error = "ID Partenaire requis";
    console.log(response.error);
    return response;
  } else if (!/^[0-9a-zA-Z]+$/.test(partnerId)) {
    response.error = "ID Partenaire ne peut contenir que des lettres et des chiffres";
    console.log(response.error);
    return response;
  } else if (name.length < 1) {
    response.error = "Renseigner le nom ";
    console.log(response.error);
    return response;
  } else if (!/^[a-zA-Z]+$/.test(name)) {
    response.error = "Le nom ne peut contenir que des lettres";
    console.log(response.error);
    return response;
  } else if (prix.length < 1) {
    response.error = "Renseigner le prix";
    console.log(response.error);
    return response;
  } else if (!isInt(prix)) {
    response.error = "Le prix ne peut contenir que des chiffres";
    console.log(response.error);
    return response;
  } else {
    console.log("Entrées valides");
    return response;
  }

},

  validatePoints: async function(points) {

    //verify input otherwise return error with an informative message
    if (isNaN(points)) {
      response.error = "Points doivent être un nombre";
      console.log(response.error);
      return response;
    } else {
      return Math.round(points);
    }

  }

}


//stackoverflow
function isInt(value) {
  return !isNaN(value) && (function(x) {
    return (x | 0) === x;
  })(parseFloat(value))
}

//stackoverflow
function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

//stackoverflow
function validatePhoneNumber(phoneNumber) {
  var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return re.test(String(phoneNumber));
}
