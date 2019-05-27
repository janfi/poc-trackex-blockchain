var apiUrl = location.protocol + '//' + location.host + "/api/";

//check user input and call server
$('.sign-in-partner').click(function() {

  //get user input data
  var formPartnerId = $('.partner-id input').val();
  var formCardId = $('.card-id input').val();

  //create json data
  var inputData = '{' + '"partnerid" : "' + formPartnerId + '", ' + '"cardid" : "' + formCardId + '"}';
  console.log(inputData);

  //make ajax call
  $.ajax({
    type: 'POST',
    url: apiUrl + 'partnerData',
    data: inputData,
    dataType: 'json',
    contentType: 'application/json',
    beforeSend: function() {
      //display loading
      document.getElementById('loader').style.display = "block";
    },
    success: function(data) {

      //remove loader
      document.getElementById('loader').style.display = "none";

      //check data for error
      if (data.error) {
        alert(data.error);
        return;
      } else {

        //update heading
        $('.heading').html(function() {
          var str = '<h2><b> ' + data.name + ' </b></h2>';
          str = str + '<h2><b> ' + data.id + ' </b></h2>';

          return str;
        });

        //update dashboard
        $('.dashboards').html(function() {
          var str = '';
          str = str + '<h5>Total points alloués au client: ... </h5>';
          return str;
        });

        //update products
        $('.products').html(function() {
          var str = '';
          data.listProduct.forEach(product => {
            str = str + '<h5>' + product.name + ' / ' + product.prix + ' euros </h5>';
          });

          return str;
        });

        showAchats();
        showAchatsUse();
        //remove login section
        document.getElementById('loginSection').style.display = "none";
        //display transaction section
        document.getElementById('transactionSection').style.display = "block";

      }

    },
    error: function(jqXHR, textStatus, errorThrown) {
      //reload on error
      alert("Error: Try again")
      console.log(errorThrown);
      console.log(textStatus);
      console.log(jqXHR);

      location.reload();
    }
  });

});

//
$('.register-product').click(function() {

  //get user input data
  var formProductId = $('.product-id input').val();
  var formName = $('.name input').val();
  var formPrix = $('.prix input').val();
  var formPartnerId = $('.partner-id input').val();
  var formCardId = $('.card-id input').val();
  //create json data
  var inputData = '{' + '"productid" : "' + formProductId + '", ' + '"name" : "' + formName + '", ' + '"prix" : "' + formPrix + '", ' + '"partnerid" : "' + formPartnerId+ '", '+ '"cardid" : "' + formCardId +'"}';
  console.log(inputData)

  //make ajax call to add the dataset
  $.ajax({
    type: 'POST',
    url: apiUrl + 'registerProduct',
    data: inputData,
    dataType: 'json',
    contentType: 'application/json',
    beforeSend: function() {
      //display loading
      document.getElementById('addproduct').style.display = "none";
      document.getElementById('loader').style.display = "block";
    },
    success: function(data) {

      //remove loader
      document.getElementById('loader').style.display = "none";

      //check data for error
      if (data.error) {
        document.getElementById('addproduct').style.display = "block";
        alert(data.error);
        return;
      } else {
        //notify successful registration
        $('.products').html(function() {
          var str = '';
          data.listProduct.forEach(product => {
            str = str + '<h5>' + product.name + ' / ' + product.prix + ' euros </h5>';
          });

          return str;
        });
        $("#products-tab").click();
        document.getElementById('addproduct').style.display = "block";
      }

    },
    error: function(jqXHR, textStatus, errorThrown) {
      //reload on error
      alert("Error: Try again")
      console.log(errorThrown);
      console.log(textStatus);
      console.log(jqXHR);
    }
  });

});

function showAchats() {

  var formPartnerId = $('.partner-id input').val();
  var formCardId = $('.card-id input').val();

  var inputData = '{' + '"cardid" : "' + formCardId +  '", ' + '"partnerid" : "' + formPartnerId + '"}';

//make ajax call
$.ajax({
  type: 'POST',
  url: apiUrl + 'showAchatsPartner',
  data: inputData,
  dataType: 'json',
  contentType: 'application/json',
  beforeSend: function() {
    //display loading
    document.getElementById('loader').style.display = "block";
  },
  success: function(data) {

    document.getElementById('loader').style.display = "none";

    //check data for error
    if (data.error) {
      alert(data.error);
      return;
    } else {

      //liste des achats
      $('.achatsdispo').html(function() {
        var str = '';
        data.listAchats.forEach(achat => {
          str = str + '<h5>' + achat.timestamp + ' - ' + achat.productId + ' - ' + achat.accountNumber + ' <button class="btn btn-outline-primary btn-sm product-part" type="submit" onclick="buyAchat(\''+achat.transactionId+'\',\''+achat.accountNumber+'\')">utiliser</button></h5>';
        });

        return str;
      });
    }

  },
  error: function(jqXHR, textStatus, errorThrown) {
    alert("Error: Try again")
    console.log(errorThrown);
    console.log(textStatus);
    console.log(jqXHR);
  },
  complete: function() {}
});

}

function showAchatsUse() {

  var formPartnerId = $('.partner-id input').val();
  var formCardId = $('.card-id input').val();

  var inputData = '{' + '"cardid" : "' + formCardId +  '", ' + '"partnerid" : "' + formPartnerId + '"}';

//make ajax call
$.ajax({
  type: 'POST',
  url: apiUrl + 'showAchatsPartnerUse',
  data: inputData,
  dataType: 'json',
  contentType: 'application/json',
  beforeSend: function() {
    //display loading
    document.getElementById('loader').style.display = "block";
  },
  success: function(data) {

    document.getElementById('loader').style.display = "none";

    //check data for error
    if (data.error) {
      alert(data.error);
      return;
    } else {

      //liste des achats
      $('.achatsuse').html(function() {
        var str = '';
        data.listAchats.forEach(achat => {
          str = str + '<h5>' + achat.accountNumber + ' - ' + achat.transactionId + '</h5>';
        });

        return str;
      });


      //update dashboard
      $('.dashboards').html(function() {
        var str = '';
        str = str + '<h5>Total points alloués au client: ' + data.listAchats.length + ' </h5>';
        return str;
      });
    }

  },
  error: function(jqXHR, textStatus, errorThrown) {
    alert("Error: Try again")
    console.log(errorThrown);
    console.log(textStatus);
    console.log(jqXHR);
  },
  complete: function() {}
});

}

function buyAchat(transactionId, accountNumber) {

  if (transactionId == undefined) return;

  var formPartnerId = $('.partner-id input').val();
  var formCardId = $('.card-id input').val();

  var inputData = '{' + '"cardid" : "' + formCardId +  '", ' + '"partnerid" : "' + formPartnerId + '", ' + '"accountnumber" : "' + accountNumber + '", ' + '"transactionid" : "' + transactionId + '"}';

  $.ajax({
    type: 'POST',
    url: apiUrl + 'buyAchat',
    data: inputData,
    dataType: 'json',
    contentType: 'application/json',
    beforeSend: function() {
      //display loading
      document.getElementById('loader').style.display = "block";
    },
    success: function(data) {
  
      document.getElementById('loader').style.display = "none";
  
      //check data for error
      if (data.error) {
        alert(data.error);
        return;
      } else {
  
        $("#achatused-tab").click();
        //liste des achats
        showAchatsUse();
      }
  
    },
    error: function(jqXHR, textStatus, errorThrown) {
      alert("Error: Try again")
      console.log(errorThrown);
      console.log(textStatus);
      console.log(jqXHR);
    },
    complete: function() {}
  });

}