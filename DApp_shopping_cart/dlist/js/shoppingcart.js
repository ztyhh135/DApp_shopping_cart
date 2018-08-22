// References: Firebase Documentation
// https://firebase.google.com/docs/storage/?authuser=0

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
// // var storageRef = firebase.storage().ref();
var database = firebase.database();
//
// var user_logged;
firebase.auth().onAuthStateChanged(function(user) {
  // If user already signed in
  if (user) {
    console.log(firebase.auth().currentUser.uid);
    App.init();
    // App.TotalPrice();


    // console.log(firebase.auth().currentUser);

    // user_logged = firebase.auth().currentUser.uid;
    // return user;
  }else{
    // window.location.href = "index.html";
  }
});
// console.log(user_logged);
// var user = firebase.auth().currentUser;
// console.log(user);
// var shoppingcartref = database.ref("ShopingCart/c");
// // console.log(shoppingcartref);
// // // //   shoppingcartref.set({
// // //     1:200,
// // //     2: 666,
// // //     5 : 888
// // //   });
// shoppingcartref.on('value', function(snapshot) {
//   console.log(snapshot.val());
//   snapshot.forEach(function(childSnapshot) {
//     var childKey = childSnapshot.key;
//     var childData = childSnapshot.val();
//     console.log(childKey);
//     // ...
//   });
// });

// var uploadFileInput = document.getElementById("uploadFileInput");
// uploadFileInput.addEventListener("change", function(){
// 	var file = this.files[0];
//   var uploadTask = storageRef.child('img/'+file.name).put(file);
//   uploadTask.on('state_changed', function(snapshot){
//     // Observe state change events such as progress, pause, and resume
//     // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
//     var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
//     console.log('Upload is ' + progress + '% done');
//     switch (snapshot.state) {
//       case firebase.storage.TaskState.PAUSED: // or 'paused'
//         console.log('Upload is paused');
//         break;
//       case firebase.storage.TaskState.RUNNING: // or 'running'
//         console.log('Upload is running');
//         break;
//     }
//   }, function(error) {
//     // Handle unsuccessful uploads
//   }, function() {
//     // Handle successful uploads on complete
//     // For instance, get the download URL: https://firebasestorage.googleapis.com/...
//     var downloadURL = uploadTask.snapshot.downloadURL;
//     var d1 = document.getElementById("item_img");
//     var img = document.createElement("img");
//     img.src=downloadURL;
//     img.id="item_img_pic";
//     d1.appendChild(img);

//     console.log(downloadURL);
//   });
// },false);

App = {
  web3Provider: null,
  contracts: {},
  TotalPrice: function() {
    var allItems = $("#shopping-cart").find(".shop-pices");
    var total = 0.0;
    allItems.each(function(){
      total += parseFloat($(this).text());
      // console.log($(this).text());
    });
    // console.log(total);

    $("#totalprice").text(total.toFixed(2));
  },
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
    // App.TotalPrice();
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
        // $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.Shop.deployed().then(function(instance) {
      shopInstance = instance;
      return shopInstance.productsCount();
    }).then(function(productsCount) {
        var shoppingCart = $("#shoppingcart");
        shoppingCart.empty();
        var TemplateHead = "<tr class='main-heading'><th id ='img'>Images</th><th class='long-txt'>Product Description</th><th>Quantity</th><th>Price</th><th>Total</th><th>Option</th></tr>";
        shoppingCart.append(TemplateHead);
        var shoppingcartref = database.ref("users/"+firebase.auth().currentUser.uid+"/Cart");
        shoppingcartref.on('value', function(snapshot) {
          if (snapshot.val()!=null) {
              snapshot.forEach(function(childSnapshot) {
                shopInstance.products(childSnapshot.key).then(function(product){
                    var id = product[0];
                    var name = product[1];
                    var qty = product[2];
                    var description = product[3];
                    var price = product[4];
                    var img = product[5];

                    var owner = product[6];
                    var available = product[7];
                    // console.log(childSnapshot.val().qty);
                    // var productTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + qty + "</td><td>" + description + "</td><td>" + price + "</td></tr>"
                    // var productTemplate = "<div class='ae-grid__item item-lg-4'><a href='/item_shop.html' class='rk-item'><img src='" + img + "' /><span class='item-meta'><h2>" + name + "</h2></span></a></div>"
                    
                    var productTemplate="<tr class='product-top'><td class='products'>";
                    productTemplate+="<a href='/item_shop.html" + "?id=" + id + "'><div class='product-img'>";
                    productTemplate+="<img src='"+ img +"' ></div></a></td>";
                    // productTemplate+="<img src='" + img + "/></a></div>";
                    productTemplate+="<td class='products-text'><div class='product-text'>";
                    productTemplate+="<h3>"+name+"</h3>";
                    productTemplate+="<p><span>"+description+"</span>";
                    productTemplate+="<span id='qty'> "+qty+" left in stock</span></p></div></td>";
                    productTemplate+="<td class='quantity'>";
                    productTemplate+="<div class='product-right'>";
                    productTemplate+="<a href='javascript:;' class='minus'>-</a>";
                    productTemplate+="<span class='num' id= 'num"+id+"'>"+ childSnapshot.val().qty +"</span>";
                    productTemplate+="<a href='javascript:;' class='plus'>+</a>";
                    productTemplate+="</div></td>";
                    productTemplate+="<td class='shop-price'><h4>$<b class='price' id='unit_price"+id+"'>"+price+"</b></h4></td>";
                    productTemplate+="<td class='shop-price'><h4>$<b class='shop-pices' id='price"+id+"'>"+price*childSnapshot.val().qty+"</b></h4></td>";
                    productTemplate+="<td class ='top-remove'><h4></h4>";
                    productTemplate+="<div class='close' id='checkout"+ id +"'><h5>Checkout</h5></div>";
                    productTemplate+="<p><a class='delete' id='delete"+ id +"'>Remove</a></p></td>";
                    productTemplate+="</tr>";
                    shoppingCart.append(productTemplate);
                    // shoppingCart.append("</div>");
                    // shoppingCart.append(productTemplate);
                    App.TotalPrice();

                });
                // var childKey = childSnapshot.key;
                // var childData = childSnapshot.val();
                // console.log(childKey);
                // // ...
              });
          }
        });
        // var templateTail = "</table></tbody>";
        // shoppingCart.append(templateTail);
        // App.TotalPrice();

    }).catch(function(error) {
      console.warn(error);
    });
    // App.TotalPrice();
    // $(".minus").click(function() {
    //   var t = $(this).parent().find('.num');
    //   t.text(parseInt(t.text()) - 1);
    //   if (t.text() <= 1) {
    //     t.text(1);
    //   }
    //   console.log("d");
    //   // TotalPrice();
    // });
    // // 数量加
    // $(".plus").click(function() {
    //   var t = $(this).parent().find('.num');
    //   t.text(parseInt(t.text()) + 1);
    //   if (t.text() <= 1) {
    //     t.text(1);
    //   }
    //   // TotalPrice();
    // });
  },
  
  bindEvents: function() {
    $(document).on('click', '.plus', App.handlePlus);
    $(document).on('click', '.minus', App.handleMinus);
    $(document).on('click', '.close', App.handleCheckout);
    $(document).on('click', '.delete', App.handleDelete);
    // App.TotalPrice();
  },
  handlePlus: function(event) {
    var t = $(this).parent().find('.num');
    // console.log(t.attr("id"));
    var totalprice = $(this).parent().parent().parent().find('.shop-pices');
    // console.log(totalprice.text());
    var qty = $(this).parent().parent().parent().find('#qty');

    var unitprice = parseInt(totalprice.text())/parseInt(t.text());
    t.text(parseInt(t.text()) + 1);
    totalprice.text(parseInt(totalprice.text())+unitprice);
    if (t.text() <= 1) {
      t.text(1);
      totalprice.text(unitprice);
    }
    if (t.text() > parseInt(qty.text())) {
      t.text(parseInt(qty.text()));
      totalprice.text(parseInt(qty.text())*unitprice);
    }
    App.TotalPrice();


    

  },
  handleMinus: function(event) {
    var t = $(this).parent().find('.num');
    var totalprice = $(this).parent().parent().parent().find('.shop-pices');
    var unitprice = parseInt(totalprice.text())/parseInt(t.text());
    t.text(parseInt(t.text()) - 1);
    totalprice.text(parseInt(totalprice.text())-unitprice);
    if (t.text() <= 1) {
      t.text(1);
      totalprice.text(unitprice);
    }
    App.TotalPrice();
  },

  handleDelete: function(event) {
    var id = $(this).attr("id").substring(6);
    var deletePath = database.ref("users/"+firebase.auth().currentUser.uid+"/Cart/"+id);
    deletePath.remove();
    window.location.reload();
  },
  handleCheckout: function(event) {

    // get exchange rate of ethereum : usd
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.coinmarketcap.com/v1/ticker/ethereum/", false);
    xhr.send();

    // if call api failed, set rate to 716(current exange rate on 14/05/18)
    var ehter_usd = "716";
    if(xhr.status=="200"){
      var ethereum_details = JSON.parse(xhr.responseText);
      ehter_usd = ethereum_details[0]["price_usd"];
    }

    var id = $(this).attr("id").substring(8);
    // console.log(id);
    var price = $(this).parent().parent().find('.shop-pices').text();
    var num = $(this).parent().parent().find('.num').text();
    var userId = firebase.auth().currentUser.uid;

    var ether_price = price/ehter_usd;
    // console.log("price",price);
    // console.log(num);
    // console.log(ether_price);
   
    App.contracts.Shop.deployed().then(function(instance) {
      // var flag =instance.BuyItem(parseInt(id),parseInt(num));
      // console.log(instance.products(id)[0]);
      shopInstance = instance;
      instance.products(id).then(function(product){
        // web3.eth.sendTransaction({from:App.account,to:App.product_owner,value:web3.toWei(App.product_price,"ether")}, (error,result)=>(console.log(result))); 
        date = new Date().getTime();
        pId = product[0];
        u_price = product[4];
        name = product[1];
        img = product[5];
        web3.eth.sendTransaction({from:App.account,to:product[6],value:web3.toWei(parseFloat(ether_price),"ether"),data:"abc123"},
          function(err,transactionHash){
            if (!err){
              web3.eth.getTransaction(transactionHash, function(error, res){
                if (!error){
                  var buyer = res.from;
                  var seller = res.to;
                  var value = res.value;
                  // console.log("buyer", buyer);
                  // console.log("seller", seller);
                  // console.log("value", value.toNumber());
                  // console.log("date",date);
                  // console.log("pId",pId.toNumber());
                  // console.log("u_price",u_price.toNumber());

                  database.ref('users/' + userId + '/Transactions/' + date).update({
                    buyer: buyer,
                    seller: seller,
                    pId: pId,
                    u_price: u_price,
                    price: price,
                    name: name,
                    img: img,
                    qty: num
                  }).catch(function(error) {
                    alert("Data could not be saved." + error);
                  }).then(function(){
                    return shopInstance.buyProduct(pId,num);
                  }).then(function(whatever){
                    var deletePath = database.ref("users/"+firebase.auth().currentUser.uid+"/Cart/"+pId);
                    deletePath.remove();
                    alert('Checkout completed.');
                    window.location.reload();
                  });


                }else{
                  console.log(error);
                }
              });
            }
          });

      });
    });
    // console.log(id);
    // var total = $("#shopping-cart").find(".price");
    // console.log(total[1].innerText);
    // App.TotalPrice();

  }

};

$(function() {
  $(window).load(function() {
    
    // var user = firebase.auth().currentUser;
    // console.log(user);
    // if(user == null){
    //     // window.location.href = "index.html";
    // }
    // App.init();
  });
});

// $(document).ready(function(){
//     var user = firebase.auth().currentUser;
//     console.log(user);
// });

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
