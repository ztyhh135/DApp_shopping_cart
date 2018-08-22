var Shop = artifacts.require("./Shop.sol");

contract("Shop", function(accounts) {

	var shopInstance;

	it("initializes with six products", function() {
    	return Shop.deployed().then(function(instance) {
      		return instance.productsCount();
    	}).then(function(count) {
            // console.log(count);
      		assert.equal(count.toNumber(), 6);
    	});
  	});

    it("it initializes the products with the correct values", function() {
        return Shop.deployed().then(function(instance) {
            shopInstance = instance;
            return shopInstance.products(1);
        }).then(function(product) {
            assert.equal(product[0], 1, "contains the correct id");
            assert.equal(product[1], "product_men", "contains the correct name");
            assert.equal(product[2], 1, "contains the correct quantity");
            assert.equal(product[3], "des_men", "contains the correct description");
            assert.equal(product[4], 1, "contains the correct price");
            assert.equal(product[5], "assets/img/men.jpg", "contains the correct img address")
            assert.equal(product[6], "0x627306090abab3a6e1400e9345bc60c78a8bef57", "contains the correct owner");
            assert.equal(product[7], true, "contains the correct availability");
            return shopInstance.products(2);
        }).then(function(product) {
           	assert.equal(product[0], 2, "contains the correct id");
            assert.equal(product[1], "product_women", "contains the correct name");
            assert.equal(product[2], 2, "contains the correct quantity");
            assert.equal(product[3], "des_women", "contains the correct description");
            assert.equal(product[4], 2, "contains the correct price");
            assert.equal(product[5], "assets/img/women.jpg", "contains the correct img address")
            assert.equal(product[6], "0x627306090abab3a6e1400e9345bc60c78a8bef57", "contains the correct owner");
            assert.equal(product[7], true, "contains the correct availability");
        });
    });

    it("add product", function() {
        return Shop.deployed().then(function(instance) {
            shopInstance = instance;
            shopInstance.addProduct("product_test", 3, "des_test", 3, "assets/img/men.jpg","other");
            return shopInstance.products(7);
        }).then(function(product) {
            assert.equal(product[0].toNumber(), 7, "contains the correct id");
            assert.equal(product[1], "product_test", "contains the correct name");
            assert.equal(product[2].toNumber(), 3, "contains the correct quantity");
            assert.equal(product[3], "des_test", "contains the correct description");
            assert.equal(product[4].toNumber(), 3, "contains the correct price");
            assert.equal(product[5], "assets/img/men.jpg", "contains the correct img address")
            assert.equal(product[6], "0x627306090abab3a6e1400e9345bc60c78a8bef57", "contains the correct owner");
            assert.equal(product[7], true, "contains the correct availability");
            assert.equal(product[8], "other", "contains the correct catetory");
        });
    });

    it("update product details", function() {
        return Shop.deployed().then(function(instance) {
                       shopInstance = instance;
            shopInstance.updateProduct(1, "item_name", 11, "item_describe", 3, "assets/img/women.jpg", "women");
            // console.log(res);
            return shopInstance.products(1);
        }).then(function(product){
            // console.log(product);
            assert.equal(product[0].toNumber(), 1, "contains the correct id");
            assert.equal(product[1], "item_name", "contains the correct name");
            assert.equal(product[2].toNumber(), 11, "contains the correct quantity");
            assert.equal(product[3], "item_describe", "contains the correct description");
            assert.equal(product[4].toNumber(), 3, "contains the correct price");
            assert.equal(product[5], "assets/img/women.jpg", "contains the correct img address")
            assert.equal(product[6], "0x627306090abab3a6e1400e9345bc60c78a8bef57", "contains the correct owner");
            assert.equal(product[7], true, "contains the correct availability");
            assert.equal(product[8], "women", "contains the correct catetory");
        });
    });

    it("buy product", function() {
        return Shop.deployed().then(function(instance) {
            shopInstance = instance;
            shopInstance.buyProduct(2,1);
            // console.log(res);
            return shopInstance.products(2);
        }).then(function(product){
            // console.log(product);
            // assert.equal(product, true, "contains the correct qty");
            assert.equal(product[2].toNumber(), 1, "contains the correct qty");
        });
    });
});