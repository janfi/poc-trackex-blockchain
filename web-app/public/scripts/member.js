var apiUrl = location.protocol + '//' + location.host + "/api/";

//check user input and call server
$('.sign-in-member').click(function() {
  updateMember();
});

function updateMember() {

  //get user input data
  var formAccountNum = $('.account-number input').val();
  var formCardId = $('.card-id input').val();

  //create json data
  var inputData = '{' + '"accountnumber" : "' + formAccountNum + '", ' + '"cardid" : "' + formCardId + '"}';
  console.log(inputData)

  //make ajax call
  $.ajax({
    type: 'POST',
    url: apiUrl + 'memberData',
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
          var str = '<h2><b>' + data.firstName + ' ' + data.lastName + '</b></h2>';
          str = str + '<h2><b>' + data.accountNumber + '</b></h2>';
          str = str + '<h2><b>' + data.points + '</b></h2>';

          return str;
        });

        $('.use-partner select').html(function() {
          var str = '<option value="" disabled="" selected="">select</option>';
          var partnersData = data.partnersData;
          for (var i = 0; i < partnersData.length; i++) {
            str = str + '<option partner-id=' + partnersData[i].id + '> ' + partnersData[i].name + '</option>';
          }
          return str;
        });

        showAchats();

        //remove login section and display member page
        document.getElementById('loginSection').style.display = "none";
        document.getElementById('transactionSection').style.display = "block";
      }

    },
    error: function(jqXHR, textStatus, errorThrown) {
      //reload on error
      alert("Error: Try again")
      console.log(errorThrown);
      console.log(textStatus);
      console.log(jqXHR);
    },
    complete: function() {

    }
  });
}


//check user input and call server
$('.use-partner').on('change', function() {

  var formPartnerId = $('.use-partner select').find(":selected").attr('partner-id');
  if (formPartnerId == undefined) return;

  var formCardId = $('.card-id input').val();
  var inputData = '{' + '"cardid" : "' + formCardId + '", ' + '"partnerid" : "' + formPartnerId + '"}';

  //make ajax call
  $.ajax({
    type: 'POST',
    url: apiUrl + 'listProductsInfo',
    data: inputData,
    dataType: 'json',
    contentType: 'application/json',
    beforeSend: function() {
      //display loading
      document.getElementById('loader').style.display = "block";
      document.getElementById('produitsdispo').style.display = "none";
    },
    success: function(data) {

      document.getElementById('loader').style.display = "none";
      document.getElementById('produitsdispo').style.display = "block";

      //check data for error
      if (data.error) {
        alert(data.error);
        return;
      } else {
        $('.produitsdispo').html(function() {
          var str = '';
          data.listProduct.forEach(product => {
            str = str + '<h5>' + product.name + ' / ' + product.prix + ' euros <button class="btn btn-outline-primary btn-sm product-part" type="submit" onclick="buyProduct('+product.id+')">acheter</button></h5>';
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
});

function buyProduct(productid) {

  if (productid == undefined) return;

  var formPartnerId = $('.use-partner select').find(":selected").attr('partner-id');
  if (formPartnerId == undefined) return;

  var formCardId = $('.card-id input').val();
  var formAccountNumberId = $('.account-number input').val();

  var inputData = '{' + '"cardid" : "' + formCardId + '", ' + '"partnerid" : "' + formPartnerId + '", ' + '"accountnumber" : "' + formAccountNumberId + '", ' + '"productid" : "' + productid + '"}';

 //make ajax call
 $.ajax({
  type: 'POST',
  url: apiUrl + 'buyProduct',
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

      $("#achats-tab").click();
      //liste des achats
      showAchats();
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

function showAchats() {

  var formCardId = $('.card-id input').val();
  var formAccountNumberId = $('.account-number input').val();

  var inputData = '{' + '"cardid" : "' + formCardId +  '", ' + '"accountnumber" : "' + formAccountNumberId + '"}';

//make ajax call
$.ajax({
  type: 'POST',
  url: apiUrl + 'showAchats',
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
      $('.achats').html(function() {
        var str = '';
        data.listAchats.forEach(achat => {
          str = str + '<h5>' + achat.buy.timestamp + ' - ' + (achat.product.name ? achat.product.name + ' / ' + achat.product.prix + ' euros': ' unknown') + '</h5>';
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