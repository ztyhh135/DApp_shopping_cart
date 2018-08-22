App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    console.log('11111111');
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
    console.log('22222222');
    return App.initContract();
    // return App.post();
  },

initContract: function() {
    $.getJSON('Shop.json', function(shop) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      console.log('333333333');
      var ShopArtifact = shop;
      App.contracts.Shop = TruffleContract(ShopArtifact);

      // Set the provider for our contract
      App.contracts.Shop.setProvider(App.web3Provider);

      return App.post();      
    });
  },

  post: function() {
    console.log('4444444444');
    var shopInstance;

    var item_name = $("#item_name").val();
    var item_describe = $("#item_describe").val();
    var item_price = $("#item_price").val();
    var quantity = $("#quantity").val();

    window.alter(item_name);

    // window.alert(item_name);

    // Load contract data
    App.contracts.Shop.deployed().then(function(instance) {
        shopInstance = instance;
        // var events = shopInstance.allEvents().watch({}, '');
        // events.watch(function(err, res) { console.log("Error: " + err); console.log("Event: " + res.event); });
        console.log("2 success!");
        // shopInstance.addProduct(item_name, quantity, item_describe, item_price, "assets/img/men.jpg");
        // var count = shopInstance.productsCount();
        // window.alert(count);
    }).catch(function(error) {
      console.warn(error);
    });
  }
};

// function post(){
//     var shopInstance;

//     var item_name = $("#item_name").val();
//     var item_describe = $("#item_describe")val();
//     var item_price = $("#item_price")val();
//     var quantity = $("#quantity")val();

//         // Load contract data
//     App.contracts.Shop.deployed().then(function(instance) {
//         shopInstance = instance;
//         shopInstance.addProduct(item_name, quantity, item_describe, item_price, "assets/img/men.jpg");
//     }
// }

// $(function() {

  $("#submit").click(function() {

    // console.log(web3.currentProvider);
    $.getJSON('Shop.json', function(shop) {

      var ShopArtifact = shop;
      var Shop = TruffleContract(ShopArtifact);
      Shop.setProvider(web3.currentProvider);

      var item_name = $("#item_name").val();
      var item_describe = $("#item_describe").val();
      var item_price = $("#item_price").val();
      var quantity = $("#quantity").val();

      Shop.deployed().then(function(instance) {
        shopInstance = instance;
        var num = shopInstance.productsCount();
        var add = shopInstance.addProduct(item_name, quantity, item_describe, item_price, "assets/img/men.jpg");
        console.log(add);
        return add;
      }).then(function(productsCount) {
        console.log(productsCount);
      }).catch(function(error) {
        console.warn(error);
      });
    });
  // $(window).load(function() {
    // post();
    // console.log('yes!');
    // App.init();
  });
// });