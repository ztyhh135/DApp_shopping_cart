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
  }else{
  }
});


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
                    productTemplate+="<a href='item_shop.html" + "?id=" + id + "'><div class='product-img'>";
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
    $(document).on('click', '.check', App.handleEmpty);
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
  handleEmpty: function(event) {
    // var id;
    // console.log("sss");
    // while(1){
    //   var item = $(".product_top");
    //   if (item==null){
    //     break;
    //   }
    //   var id = item.find('.delete').attr("id").substring(6);
    //   var deletePath = database.ref("users/"+firebase.auth().currentUser.uid+"/Cart/"+id);
    //   deletePath.remove();
    var deletePath = database.ref("users/"+firebase.auth().currentUser.uid+"/Cart");
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
    var price = $(this).parent().parent().find('.shop-pices').text();
    var num = $(this).parent().parent().find('.num').text();
    var userId = firebase.auth().currentUser.uid;

    var ether_price = price/ehter_usd;
    console.log("price",price);
    console.log(ehter_usd);
    console.log(ether_price);
   
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
        var value_wei = (web3.toWei(parseFloat(ether_price),"ether"));
        // console.log(v);
        // shopInstance.withdraw(web3.toWei(parseFloat(ether_price),"ether"),{gas:4712388});
        // shopInstance.transfer("0x627306090abaB3A6e1400e9345bC60c78a8BEf57",v,{gas:4712388});

        document.getElementById("over").style.display = "block";
        document.getElementById("layout").style.display = "block";
        shopInstance.deposit(pId,num,{value:value_wei,gas:2000000}).then(function(){
          var buyer = App.account;
          var seller = product[6];
          database.ref('users/' + userId + '/Transactions/' + date).update({
            buyer: buyer,
            seller: seller,
            pId: pId,
            u_price: u_price,
            price: price,
            name: name,
            img: img,
            qty: num,
            wei: value_wei,
            completed: 0
          }).catch(function(error) {
            alert("Data could not be saved." + error);
          }).then(function(){
            var deletePath = database.ref("users/"+firebase.auth().currentUser.uid+"/Cart/"+pId);
            deletePath.remove();    
            document.getElementById("over").style.display = "none";
            document.getElementById("layout").style.display = "none";        
            alert('Checkout completed.');
            window.location.reload();
          });
          
        }).catch(function(error) {
          console.warn(error);
          document.getElementById("over").style.display = "none";
          document.getElementById("layout").style.display = "none"; 
        });

      });
    });
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
