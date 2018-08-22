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

      App.listenForEvents();

      return App.render();      
    });
    return App.bindEvents();
  },

    // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.Shop.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393

      // instance.productAdded().watch(function(error, event) {
      //   console.log("event triggered", event);
      //   alert("Product is added");
        // Reload when a new vote is recorded
        // App.render();

      const addProductEvent = instance.productAdded();
      addProductEvent.watch(function(error,result){
      //   if(err){
      //     console.log('error',err);
      //   }else{
        if(!error){
          console.log("event triggered", result.event, result.args.id)
          // alert()
        }
      });
      //   App.render();
      
    });
  },


  render: function() {

    var shopInstance;
    var loader = $("#loader");
    var content = $("#loaded");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });
    var ProductResults = $("#container");
    ProductResults.empty();
    // Load contract data
    App.contracts.Shop.deployed().then(function(instance) {
      shopInstance = instance;
      return shopInstance.productsCount();
    }).then(function(productsCount) {
      // ProductResults = $("#container");
      

      for (var i = 1; i <= productsCount; i++) {
        shopInstance.products(i).then(function(product) {
          // console.log(product[0].toNumber(), product[1]);


          var id = product[0];
          var name = product[1];
          var qty = product[2];
          var description = product[3];
          var price = product[4];
          var img = product[5];
          var cat = product[8];
          var status = product[7];

          if (status){
         

            // console.log(i + "iteration");

            // Render product Result
            // var productTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + qty + "</td><td>" + description + "</td><td>" + price + "</td></tr>"
            // console.log(search==null ||name.indexOf(search)>=0);
            search= location.search;
            var search_word;
            if(search!=null){
              search_word = search.substring(8);
            }
            console.log(search_word);
            if(search==null || name.indexOf(search_word)>=0){
              var productTemplate = "<div class='element item_"+ cat + "'><a class='zrx_a' href='item_shop.html" + "?id=" + id + "'><img src='" + img + "'><p class = 'zxr_p'>"+name+"</p><p class='showshangpin_zxr_p'>$"+price.toFixed(2)+"</p></a></div>";
              ProductResults.append(productTemplate);
            }
           }
          
        });
      }

      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    }).then(function(){

    });




  },
  bindEvents: function() {
    $(document).on('keydown', '#search', App.search);
    $(document).on('click', '#search_button', App.search_button);
  },
  search_button:function(event){
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



  post_item: function() {

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

      // console.log();
      App.contracts.Shop.deployed().then(function(instance) {
        shopInstance = instance;

        // console.log(item_name,item_describe,item_price,item_quantity,item_img,item_cat);
        // console.log(item_describe);
        if (item_name==""||item_price==""||item_quantity==""){
          console.log("sss");
          alert('name, price and quantity should not be empty.');
          return false;
        }
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
        document.getElementById("over").style.display = "block";
        document.getElementById("layout").style.display = "block";

        return shopInstance.addProduct(item_name, item_quantity, item_describe, item_price, item_img, item_cat);


      }).then(function(result) {
 
        // receipt status will return 1 for succesful transaction and 0 for failed transaction
        if(result != false && result.receipt.status!=0){

          document.getElementById("over").style.display = "none";
          document.getElementById("layout").style.display = "none"; 
          alert('Your product has been added.');
          window.location.href = "index.html";
        }

      }).catch(function(error) {
        document.getElementById("over").style.display = "none";
        document.getElementById("layout").style.display = "none"; 
        alert(error);
      });
    });
  }


};

function fade(){
        var $container = $('#container');
      // console.log(container);

          $container.isotope({
            itemSelector : '.element'
          });
          var $optionSets = $('#options .option-set'),
              $optionLinks = $optionSets.find('a');

          $optionLinks.click(function(){
            var $this = $(this);
            // don't proceed if already selected
            if ( $this.hasClass('selected') ) {
              return false;
            }
            var $optionSet = $this.parents('.option-set');
            $optionSet.find('.selected').removeClass('selected');
            $this.addClass('selected');
            // make option object dynamically, i.e. { filter: '.my-filter-class' }
            var options = {},
                key = $optionSet.attr('data-option-key'),
                value = $this.attr('data-option-value');
            // parse 'false' as false boolean
            value = value === 'false' ? false : value;
            options[ key ] = value;
            if ( key === 'layoutMode' && typeof changeLayoutMode === 'function' ) {
              // changes in layout modes need extra logic
              changeLayoutMode( $this, options )
            } else {
              // otherwise, apply new options
              $container.isotope( options );
            }
            return false;
          });
}

$(function() {
  setTimeout("fade()",1500);
  $(window).load(function() {
    App.init();     
  });
});








