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
			var email_id = user.email;
			$('#personal_uid_span').text(email_id);
		}
	}else {
		logout();
	}

});

function logout(){
  firebase.auth().signOut();
  window.location.href = "index.html";
}


App = {
  web3Provider: null,
  contracts: {},
  TotalPrice: function() {
    var allItems = $("#shopping-cart").find(".price");
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
	  }
	});
  },


  bindEvents: function() {
    $(document).on('click', '#remove', App.deactiveProduct);
    $(document).on('click', '#repost', App.activeProduct);
    $(document).on('click', '#confirm', App.confirmProductReceived);
    $(document).on('click', '#cancel', App.getRefund);
  },


  handlePost: function(){
  	App.contracts.Shop.deployed().then(function(instance) {
  		shopInstance = instance;
  		return shopInstance.productsCount();
  	}).then(function(count){
  		var itemResult = $("#item_list");
  		itemResult.empty();
  		for (var i = 1; i <= count; i++) {
  			shopInstance.products(i).then(function(product) {
  				var pId = product[0];
  				var owner = product[6];
  				var name = product[1];
  				var img = product[5];
  				var available = product[7];
  				// console.log('owner address',owner);
  				// console.log('current address',App.account);

  				if(App.account==owner){
	  				var output = "<li>";
					output+= "<div class='list_img' id='"+pId+"' >";
					output+= "<img src='" + img  + "'" + "</div></div>";
					output+= "<div class='list_detail'>";
					output+= "<h3>" + name +"</h3>";
					if(available){
						output+= "<a href='update_product.html?id=" + pId + "'>Edit</a>";
						output+= "<a id='remove' href='javascript:;'>Remove</a>";
					}else{
						output+="<a id='repost' href='javascript:;'>Repost</a>";
					}
					output+= "</div></li>"
					itemResult.append(output);
				}
  			});
  		}
  	});

  },
  activeProduct: function(){
  	if (confirm("Do you want to repost this item?")==true){
  		// console.log("sss");
  		var id = $(this).parent().parent().find(".list_img").attr("id");
  		// console.log(id);
  		App.contracts.Shop.deployed().then(function(instance) {
	  		shopInstance = instance;
	  		
	  		shopInstance.changeStatus(parseInt(id), true).then(function(){
	  			// await sleep(2000);
	  			setTimeout(App.handlePost(), 2000);
	  		});

  		// return shopInstance.productsCount();
	  	});
  	}else{
		// console.log("aaa");
  	}
  },
  deactiveProduct: function(){
  	if (confirm("Are you sure to remove this item?(You can repost it in this page)")==true){
  		// console.log("sss");
  		var id = $(this).parent().parent().find(".list_img").attr("id");
  		// console.log(id);
  		App.contracts.Shop.deployed().then(function(instance) {
	  		shopInstance = instance;
	  		
	  		shopInstance.changeStatus(parseInt(id), false).then(function(){
	  			setTimeout(App.handlePost(), 2000);
	  		});

  		// return shopInstance.productsCount();
	  	});
  	}else{
		// console.log("aaa");
  	}
  },

  confirmProductReceived: function(){
  	console.log("received!");
  	if (confirm("Are you sure you have received this product? Corresponding money will send to seller")==true){
  		var user = firebase.auth().currentUser;
		var uId = user.uid;
  		var timeId = $(this).parent().parent().find(".list_img").attr("timeStamp");
  		var transDetailRef = firebase.database().ref("users/"+uId+"/Transactions/"+timeId);
  		
		transDetailRef.update({
			completed: 1,
			status: "completed"
		});

  		transDetailRef.on('value',function(snapshot) {
  			var details = snapshot.val();
  			App.contracts.Shop.deployed().then(function(instance) {
	  			shopInstance = instance;
	  			document.getElementById("over").style.display = "block";
        		document.getElementById("layout").style.display = "block";
	  			shopInstance.confirmTransfer(details.seller,details.wei,{gas:2000000})
	  			.then(function(){
	  				alert("Thank you for your purchase.");
	  				document.getElementById("over").style.display = "none";
		        	document.getElementById("layout").style.display = "none";
	  				window.location.reload();
	  			});
  			}).catch(function(error) {
		        document.getElementById("over").style.display = "none";
		        document.getElementById("layout").style.display = "none"; 
		        console.warn(error);
		    });
  		});
  	}
  },

  getRefund: function(){
  	console.log("refund!");
  	if (confirm("Are you sure you want to cancel this order? Money will refund to your account")==true){
  		var user = firebase.auth().currentUser;
		var uId = user.uid;
  		var timeId = $(this).parent().parent().find(".list_img").attr("timeStamp");
  		console.log("timeStamp",timeId);
  		var transDetailRef = firebase.database().ref("users/"+uId+"/Transactions/"+timeId);

		transDetailRef.update({
			completed: 1,
			status: "canceled"
		});

		

  		transDetailRef.on('value',function(snapshot) {
  			var details = snapshot.val();
  			// console.log(details.wei)

  			App.contracts.Shop.deployed().then(function(instance) {
	  			shopInstance = instance;
	  			document.getElementById("over").style.display = "block";
        		document.getElementById("layout").style.display = "block";
	  			shopInstance.refund(details.wei,details.pId,details.qty,{gas:2000000})
	  			.then(function(){
		  			alert("Corresponding ether has been refunded to your account.");
		  			document.getElementById("over").style.display = "none";
		        	document.getElementById("layout").style.display = "none";
	  				window.location.reload();
		  		});
	  		
	  		}).catch(function(error) {
		        document.getElementById("over").style.display = "none";
		        document.getElementById("layout").style.display = "none"; 
		        console.warn(error);
		    });
  		});
  	}
  },

  handleCart: function(){
  	window.location.href = "item_cart.html"
  },

  handleTrans: function(){
	var user = firebase.auth().currentUser;
	var uId = user.uid;
	var transRef = firebase.database().ref("users/"+uId+"/Transactions");
	var res = new Array();

	// App.contracts.Shop.deployed().then(function(instance) {
	// console.log("hello");

	var tranResult = $("#Transaction_record");
	tranResult.empty();
	var timeList = Array();

		transRef.once('value').then(function(snapshot) {
	    	if (snapshot.val()!=null) {
	    		// var time = snapshot.val();
	    		// console.log('time',time);
	        	snapshot.forEach(function(childSnapshot) {
	        		var time = new Array(childSnapshot.key);
	        		timeList.push(time);
	        		var childData = childSnapshot.val();
	        		res.push(childData);
	        	});
	      	}
	      	return res;
	    }).then(function(result){
			for(i =0; i<result.length;i++){
				// console.log('result',timeList[i][0]);
				var buyer = result[i].buyer;
				var pId = result[i].pId;
				var price = result[i].price;
				var seller = result[i].seller;
				var u_price = result[i].u_price;
				var value = result[i].value/(1e18);
				var img = result[i].img;
				var name = result[i].name;
				var date = new Date(parseInt(timeList[i][0]));
				var qty = result[i].qty;
				// console.log('date', date);
				var month = date.getMonth() + 1; //months from 1-12
				var day = date.getDate();
				var year = date.getFullYear();

				var newdate = year + "/" + month + "/" + day;
				var output = "<li>";
				output+= "<div class='list_img' timeStamp='"+timeList[i][0]+"' id='"+pId+"'  >";
				output+= "<img src='" + img  + "'" + "</div></div>";
				output+= "<div class='list_detail'>";
				output+= "<h3>" + name +"</h3>";
				output+= "<p> product unit price : $" + u_price +"</p>";
				output+= "<p> qty : " + qty +"</p>";
				output+= "<p> price : $" + price +"</p>";
				output+= "<p class = 'time'> " + newdate +"</p>";
				if (result[i].completed==0){
					output+= "<a id='confirm' href='javascript:;'>Confirm</a>";
					output+= "<a id='cancel' href='javascript:;'>Cancel</a>";
				}else{
					output+= "<p id='status'>" + result[i].status + "</p>";
				}
				output+= "</div></li>"
				tranResult.append(output);
			}
	    });
  }
};




