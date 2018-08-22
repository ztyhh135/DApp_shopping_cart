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
  },

  render: function() {

    var shopInstance;
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
      var pId = location.search.substring(4);
      shopInstance.products(pId).then(function(product) {
        var name = product[1];
        var qty = product[2];
        var description = product[3];
        var price = product[4];
        var img_url = product[5];
        var cat = product[8];

        // console.log(name);
        // console.log(qty);
        // console.log(description);
        // console.log(price);
        // console.log(img);
        // console.log(cat);

        var d1 = document.getElementById("item_img");
        var img = document.createElement("img");
        img.src=img_url;
        img.id="item_img_pic";
        d1.appendChild(img);

        console.log("old url",img_url);


        document.getElementById("item_name").value = name;
        document.getElementById("item_quantity").value = qty;
        document.getElementById("item_describe").value = description;
        document.getElementById("item_price").value = price;
        // document.getElementById("item_img").value = img_url;
        document.getElementById("cat").value = cat;
      });

    });
  },

  update_product: function() {
    var pId = location.search.substring(4);

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      var item_name = $("#item_name").val();
      var item_describe = $("#item_describe").val();
      var item_price = $("#item_price").val();
      var item_quantity = $("#item_quantity").val();
      var item_img = "null";
      var item_cat = $("#cat").val();
      if ( $("#item_img_pic").length){
        item_img = $("#item_img_pic")[0].src;
      }
      console.log("new url",item_img);

      // console.log();
      App.contracts.Shop.deployed().then(function(instance) {
        shopInstance = instance;

        console.log(item_name,item_describe,item_price,item_quantity,item_img,item_cat);

        if (isNaN(item_price)==true || isNaN(item_quantity)==true){
          // console.log(isNaN(item_price));
          alert('price and quantity should be numbers.');
          return false;
        }

        else if ( (!isNaN(item_price) && !isNaN(item_quantity)) && (item_price<0 || item_quantity<0)){
          alert('price and quantity should not less than 0.');
          return false;
        }

        else if(!Number.isInteger(Number(item_quantity))){
          alert('quantity should be integer >= 0');
          return false;
        }
        
        
        // return shopInstance.addProduct(item_name, item_quantity, item_describe, item_price, item_img, item_cat);
        return shopInstance.updateProduct(pId, item_name, item_quantity, item_describe, item_price, item_img, item_cat);

      }).then(function(product) {

        // receipt status will return 1 for succesful transaction and 0 for failed transaction
        
        alert('Your product has been updated.');
        var path = 'item_shop.html?id=' + pId;
        window.location = path;

      }).catch(function(error) {
        console.warn(error);
      });
    });
  }
};



$(function() {
  $(window).load(function() {
    App.init();     
  });
  // setTimeout("fade()",1000);
});