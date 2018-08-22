// Initialize Firebase

var config = {
  apiKey: "AIzaSyDRGgmMTpcB64h5Na9opZ93DsCD_cV147o",
  authDomain: "mango-magic.firebaseapp.com",
  databaseURL: "https://mango-magic.firebaseio.com",
  projectId: "mango-magic",
  storageBucket: "mango-magic.appspot.com",
  messagingSenderId: "590370440474"
};
firebase.initializeApp(config);


firebase.auth().onAuthStateChanged(function(user) {
  var user = firebase.auth().currentUser;

  if (user) {
    if(user != null){
      $("#btnbuy").show();
      $("#btnadd").show();
    }
  
  }else {
    $("#btnbuy").hide();
    $("#btnadd").hide();
  }
  if (App.account==App.product_owner){
    $("#btnbuy").hide();
    $("#btnadd").hide();
  }

});


App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
    // If no injected web3 instance is detected, fall back to Ganache
    App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Shop.json', function(shop) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var ShopArtifact = shop;
      App.contracts.Shop = TruffleContract(ShopArtifact);

      // Set the provider for our contract
      App.contracts.Shop.setProvider(App.web3Provider);

      return App.render();      
    });
    return App.bindEvents();
  },


  render: function() {

    var shopInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.Shop.deployed().then(function(instance) {
      shopInstance = instance;
      return shopInstance.productsCount();
    }).then(function(productsCount) {
      // var ProductResults = $("#ProductResults");
      // ProductResults.empty();
      var id = location.search.substring(4);
      shopInstance.products(id).then(function(product) {
        
        var name = product[1];
        var qty = product[2];
        console.log(qty);
        var description = product[3];
        var price = product[4];
        App.product_price = price;
        var img = product[5];
        var owner = product[6];
        App.product_owner = owner;
        var available = product[7];
        $("#name").text(name);
        $("#description").text(description);
        $(".describ").text(description);
        $("#image_1").attr("src",img);
        $("#price").text("$"+price);
        $("#qty").text(qty);
        $("#ii").text(name);
        $("#ii").text(name);
        // console.log(owner);
        if (App.account==owner){

          $("#btnbuy").hide();
          $("#btnadd").hide();
          
        }
        var review = $("#review_content");
        review.empty();
        var reviewref = firebase.database().ref("product/"+id+"/review");
        reviewref.on('value', function(snapshot){
          if (snapshot.val()!=null) {
              snapshot.forEach(function(childSnapshot) {
                
                // user = childSnapshot.val().user
                // console.log(user);


               
                var reviewTemplate="<div class='review_item'>";
                reviewTemplate+="<div>"+childSnapshot.val().user+"</div>";
                reviewTemplate+="<div id='star"+childSnapshot.key+"'>" +"</div>";
                reviewTemplate+="<div>"+childSnapshot.val().content+"</div>";
                reviewTemplate+="<div>"+childSnapshot.val().date+"</div>";
                reviewTemplate+="</div>";

                review.append(reviewTemplate);
                $("#star"+childSnapshot.key).raty({
                  path:"img",
                  readOnly:true,
                  score:childSnapshot.val().rate
                });
              });
              
            }
        });
       

      });

      // for (var i = 1; i <= productsCount; i++) {
      //   shopInstance.products(i).then(function(product) {
      //     var id = product[0];
      //     var name = product[1];
      //     var qty = product[2];
      //     var description = product[3];
      //     var price = product[4];
      //     var img = product[5];

      //     console.log(i + "iteration")

      //     // Render product Result
      //     // var productTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + qty + "</td><td>" + description + "</td><td>" + price + "</td></tr>"
      //     var productTemplate = "<div class='ae-grid__item item-lg-4'><a href='/item_shop.html' class='rk-item'><img src='" + img + "' /><span class='item-meta'><h2>" + name + "</h2></span></a></div>"
      //     // ProductResults.append("<div class='ae-grid__item item-lg-4'><a href='item-url' class='rk-item'>");
      //     // ProductResults.append("<a href='item-url' class='rk-item'>");
      //     // ProductResults.append("<img src='" + img + "' />");
      //     // ProductResults.append("<span class='item-meta'>");
      //     // ProductResults.append("<h2>" + name + "</h2>");
      //     // ProductResults.append("</span>");
      //     // ProductResults.append("</a>");
      //     // ProductResults.append("</div>");
      //     ProductResults.append(productTemplate);
      //   });
      // }

      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });

  },
  bindEvents: function() {
    $(document).on('click', '#btnbuy', App.handleBuy);
    $(document).on('click', '#btnadd', App.handleAddToCart);
    $(document).on('keydown', '#search', App.search);
    $(document).on('click', '#search_button', App.search_button);
    $(document).on('click', '#send_review', App.send_review);
  },
  send_review:function(event){
    var id = location.search.substring(4);
    var ref = firebase.database().ref("product/"+id+"/review");
    var review_id=1;
    var rate = $("#result").text();
    var content = $("#post_review").val();
    var date = new Date().toLocaleDateString();
    var user = firebase.auth().currentUser;
    ref.on('value', function(snapshot){
      snapshot.forEach(function(childSnapshot) {
        review_id+=1;
      });
    });
    // var write_ref= firebase.database().ref("product/"+id+"/review/"+review_id);
    firebase.database().ref("product/"+id+"/review/"+review_id).update({
        user: user.email,
        rate:rate,
        content:content,
        date:date
        
      }).then(function(){
        firebase.database().ref("users/"+user.uid+"/Transactions/"+App.tranc).update({
          reviewed :1
        });
        alert('success');
        window.location.reload();
      }).catch(function(error) {
        alert("Review could not be saved." + error);
      });
  },
  search_button:function(event){
    // console.log($(this).val());
    // console.log(event.onclick);
    // if(event.keyCode==13){
    //   App.render($(this).val());
    //   // console.log($(this).val());
    // }
    window.location.href="index.html?search="+$(this).parent().find('#search').val();
    
  },
  search:function(event){
    // console.log($(this).val());
    // console.log(event.onclick);
    if(event.keyCode==13){
      // App.render($(this).val());
      // console.log($(this).val());
      window.location.href="index.html?search="+$(this).parent().find('#search').val();
    }
    
  },

//   markAdopted: function(adopters, account) {
//     var adoptionInstance;

//     App.contracts.Adoption.deployed().then(function(instance) {
//       adoptionInstance = instance;

//       return adoptionInstance.getAdopters.call();
//     }).then(function(adopters) {
//       for (i = 0; i < adopters.length; i++) {
//         if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
//           $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
//         }
//       }
//     }).catch(function(err) {
//       console.log(err.message);
//     });
//   },

  handleBuy: function(event) {
    // event.preventDefault();
    // web3.eth.sendTransaction({from:App.account,to:App.product_owner,value:web3.toWei(App.product_price,"ether")}, (error,result)=>(console.log(result))); 
    // console.log(App.product_owner); 
    
    // var petId = parseInt($(event.target).data('id'));
    // var adoptionInstance;

    // web3.eth.getAccounts(function(error, accounts) {
    //   if (error) {
    //     console.log(error);
    //   }

    //   var account = accounts[0];

    //   App.contracts.Adoption.deployed().then(function(instance) {
    //     adoptionInstance = instance;

    // // Execute adopt as a transaction by sending account
    //     return adoptionInstance.adopt(petId, {from: account});
    //   }).then(function(result) {
    //     return App.markAdopted();
    //   }).catch(function(err) {
    //    console.log(err.message);
    //   });
    // });
    event.preventDefault();

    var user = firebase.auth().currentUser;
    var userId = user.uid;
    var pId = location.search[4];
    var ava = parseInt(document.getElementById("qty").innerText);
    var num = parseInt(document.getElementById("num").value);

    if(ava>=num && num>0){

      firebase.database().ref('users/' + userId + '/Cart/' + pId).update({
        qty: num
        
      }).then(function(){
        // alert('added to cart');
        window.location.href="item_cart.html";
      }).catch(function(error) {
        alert("Data could not be saved." + error);
      });
    }else{
      alert('qty should more than 0 and should not greater than availablility');
    }
  

  },

  handleAddToCart: function(event) {
    event.preventDefault();

    var user = firebase.auth().currentUser;
    var userId = user.uid;
    var pId = location.search.substring(4);
    var ava = parseInt(document.getElementById("qty").innerText);
    var num = parseInt(document.getElementById("num").value);

    if(ava>=num && num>0){

      firebase.database().ref('users/' + userId + '/Cart/' + pId).update({
        qty: num
        
      }).then(function(){
        alert('added to cart');
      }).catch(function(error) {
        alert("Data could not be saved." + error);
      });
    }else{
      alert('qty should more than 0 and should not greater than availablility');
    }
  }

};

$(function() {
  $(window).load(function() {
    App.init();


    $("#star_review").raty({
      hints: ['1', '2', '3', '4', '5'],
      path:"img",
      target: '#result',
      targetKeep : true

    });
  });
});



firebase.auth().onAuthStateChanged(function(user) {
  var user = firebase.auth().currentUser;

  if (user) {
    if(user != null){
      var email_www = user.email;
      //alert('login user is' + email_id);
      $('#user_name').text(email_www);
      $('#user_name').attr('href','account.html');
      $('.log_hide').css('display','none');
      $('.log_show').css('display','block');

      var id = location.search.substring(4);
      var flag= false;
      firebase.database().ref("users/"+user.uid+"/Transactions").on('value', function(snapshot){
        snapshot.forEach(function(childSnapshot) {
          if (childSnapshot.val().pId==id && childSnapshot.val().reviewed!=1){
            flag=true;
            App.tranc = childSnapshot.key;
            // console.log(flag);
          }
        });
        if(flag==true){
          $('#review_form').css('display','block');
        }else{
          $('#review_form').css('display','none');
      }
      });
      // console.log(flag);
      

    }
  }else {
    $('.log_hide').css('display','block');
    $('.log_show').css('display','none');
  }


});

function logout(){
  firebase.auth().signOut();
  window.location.href = "index.html";
}

