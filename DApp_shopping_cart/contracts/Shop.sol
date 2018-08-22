pragma solidity ^0.4.17;

contract Shop {

	// Model Product
	struct Product{
		uint pId;
		string pName;
		uint   quantity;
		string description;
		uint price;
		string img;
		address owner;
		bool available;
		string cat;
	}



	event logProductAdded(uint id);
	event logDeposit(address sender, uint amount);
    event logRefund(address receiver, uint amount);
    event logTransfer(address sender, address to, uint amount);
    event logProductUpdated(uint id);

	// Store Products count
	uint public productsCount;

	// Store products
	mapping(uint => Product) public products;


	// Store balance, between transaction
	mapping (address => uint256) public balances;

	// Buyer send money to contract
	function deposit(uint _pId, uint _num) payable public returns(bool success) {
        balances[msg.sender] +=msg.value;
        buyProduct(_pId,_num);
        logDeposit(msg.sender, msg.value);
        return true;
    }

    // Send money back to buyer
    function refund(uint value, uint _pId, uint _num) public returns(bool success) {
        if(balances[msg.sender] < value) throw;
        balances[msg.sender] -= value;
        msg.sender.transfer(value);
   		returnProduct(_pId,_num);
   		logRefund(msg.sender, value);
        return true;
    }

    // Transfer money to seller
    function confirmTransfer(address to, uint value) public returns(bool success) {
        if(balances[msg.sender] < value) throw;
        balances[msg.sender] -= value;
        to.transfer(value);
        logTransfer(msg.sender, to, value);
        return true;
    }

	function Shop () public {
		addProduct("sweater", 5, "blue ladies sweater", 30, "https://firebasestorage.googleapis.com/v0/b/mango-magic.appspot.com/o/img%2Fproduct_1.jpg?alt=media&token=dfce0df2-a96e-43c2-a8f0-bc0ffd7a6dca","ladies");
		addProduct("pants", 2, "grey pants", 70, "https://firebasestorage.googleapis.com/v0/b/mango-magic.appspot.com/o/img%2Fproduct_11.jpg?alt=media&token=41acc7a5-5863-479a-8e60-668d1f950ae1","men");
		// addProduct("Suit", 10, "purplish blue Suit", 100, "https://firebasestorage.googleapis.com/v0/b/mango-magic.appspot.com/o/img%2Fproduct_10.jpg?alt=media&token=7cde2a0d-a9ba-4f74-8922-cb5433bb90e1","men");
		// addProduct("jacket", 20, "Black jacket", 55, "https://firebasestorage.googleapis.com/v0/b/mango-magic.appspot.com/o/img%2Fproduct_17.jpg?alt=media&token=bd30c979-717d-4b62-a245-c4374124d61f","men");
		// addProduct("legging", 50, "black legging", 39, "https://firebasestorage.googleapis.com/v0/b/mango-magic.appspot.com/o/img%2Fproduct_3.jpg?alt=media&token=be2bf98f-358e-4a15-bea2-f03b88ad8294","ladies");
		// addProduct("jeans", 30, "blue jeans", 40, "https://firebasestorage.googleapis.com/v0/b/mango-magic.appspot.com/o/img%2Fproduct_27.jpg?alt=media&token=462cf076-5a4a-4279-a5b3-a143dcf40831","men");
		// addProduct("hoodie", 15, "yellow hoodie", 49, "https://firebasestorage.googleapis.com/v0/b/mango-magic.appspot.com/o/img%2Fproduct_4.jpg?alt=media&token=9757b203-a1b9-4a82-86c4-6f8bcbdf0610","ladies");
		// addProduct("hoodie", 8, "grey hoodie", 48, "https://firebasestorage.googleapis.com/v0/b/mango-magic.appspot.com/o/img%2Fproduct_6.jpg?alt=media&token=6fd075ef-5738-43aa-a2e4-aa853f1a9040","ladies");
		// addProduct("jeans", 1, "blue jeans", 47, "https://firebasestorage.googleapis.com/v0/b/mango-magic.appspot.com/o/img%2Fproduct_21.jpg?alt=media&token=33997c6b-76dd-40ab-9565-061eb207266b","ladies");
		// addProduct("sweater", 1, "black ladies sweater", 46, "https://firebasestorage.googleapis.com/v0/b/mango-magic.appspot.com/o/img%2Fproduct_26.jpg?alt=media&token=d3a9047d-6816-4209-84d3-0ff84d054f7b","ladies");
		// addProduct("Shirt and slipover", 5, "Shirt and slipover", 45, "https://firebasestorage.googleapis.com/v0/b/mango-magic.appspot.com/o/img%2Fkids_1.jpg?alt=media&token=ce3982cd-ae3c-4cc1-963d-c861510898e5","kids");
		// addProduct("Jacquard-knit jumper", 8, "Jacquard-knit jumper", 44, "https://firebasestorage.googleapis.com/v0/b/mango-magic.appspot.com/o/img%2Fkids_3.jpg?alt=media&token=62e3c96a-86f1-4a41-b6ea-e0159717ccb2","kids");
		// addProduct("cover set", 7, "Leaf-print cover set", 43, "https://firebasestorage.googleapis.com/v0/b/mango-magic.appspot.com/o/img%2Fothers_1.jpg?alt=media&token=063a3a5c-da73-46f9-8d4a-f25acf2a7480","others");
		// addProduct("cover set", 15, "pink cover set", 42, "https://firebasestorage.googleapis.com/v0/b/mango-magic.appspot.com/o/img%2Fothers_2.jpg?alt=media&token=fd171d4f-93fe-45c0-914e-e886e4393322","others");
		// addProduct("pillowcase", 18, "grey pillowcase", 15, "https://firebasestorage.googleapis.com/v0/b/mango-magic.appspot.com/o/img%2Fothers_3.jpg?alt=media&token=4900ef57-789a-47ea-b032-dcb58b61b321","others");
	}	

	function addProduct (string _pName, uint _quantity, string _description, uint _price, string _img, string _cat) public returns (bool succcess) {
		address _owner = msg.sender;
		productsCount++;

		var newProduct = Product(productsCount, _pName, _quantity, _description, _price, _img, _owner,true, _cat);
		if(validProduct(newProduct)){
			products[productsCount] = newProduct;
			logProductAdded(productsCount);
			return true;
		}
		return false;
	}

	function validProduct(Product product) private returns (bool valid){
		return (product.price>=0 && product.quantity>0);
	}

	// Update product 
	function updateProduct (uint _pId, string newName, uint newQuantity, string newDescription, uint newPrice, string newImgUrl, string newCat) public {
		// require valid pId
		require(_pId >0 && _pId<= productsCount);
		// require product is available
		require(products[_pId].available);
		// require only msg sender is onwer 
		require(msg.sender == products[_pId].owner);
		// change product price

		// Update product details
		products[_pId].pName = newName;
		products[_pId].quantity = newQuantity;
		products[_pId].description = newDescription;
		products[_pId].price = newPrice;
		products[_pId].img = newImgUrl;
		products[_pId].cat = newCat;
		logProductUpdated(_pId);
	}

	// after paying deposit, available number should decrease 
	function buyProduct(uint _pId, uint num) public {
		products[_pId].quantity-=num;
	}

	// if order is canceled, available number should increase 
	function returnProduct(uint _pId, uint num) public {
		require(_pId >0 && _pId<= productsCount);
		products[_pId].quantity+=num;
	}

	// change product status
	function changeStatus (uint _pId, bool _available) public {
		require(_pId >0 && _pId<= productsCount);
		products[_pId].available = _available;
	}
	

}