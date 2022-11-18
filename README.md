<h1>Magical Spirits</h1>
<h2>A simple RESTful API for Purchases and Products</h2>

## Features

<b>Products Features</b>

| Feature  |  Coded?       | Description  |
|----------|:-------------:|:-------------|
| Add a Product | &#10004; | Ability of Add a Product on the System |
| List Products | &#10004; | Ability of List Products |
| Edit a Product | &#10004; | Ability of Edit a Product |
| Delete a Product | &#10004; | Ability of Delete a Product |
| Stock | &#10004; | Ability of Update the Stock |
| Stock History | &#10004; | Ability to see the Stock History |

<b>Purchase Features</b>

| Feature  |  Coded?       | Description  |
|----------|:-------------:|:-------------|
| Create a Cart | &#10004; | Ability of Create a new Cart |
| See Cart | &#10004; | Ability to see the Cart and it items |
| Remove a Cart | &#10004; | Ability of Remove a Cart |
| Add Item | &#10004; | Ability of add a new Item on the Cart |
| Remove a Item | &#10004; | Ability of Remove a Item from the Cart |
| Checkout | &#10004; | Ability to Checkout |

# eCommerce

**eCommerce** it's an open source software made to create a easy and simple "Shop" API, where you have two micro services, one the **Products API** that stores and handles everything Related to Stock and Products. And the **Purchase API** where you can create orders (cart's) and checkout items.

The purpose of this repository it's for education and test. But the code it's being coded in a proper way.

## Documentation

**eCommerce** has a full API documentation made with [figma]

If you want to **Contribute** you can submit a Pull Request, remember to READ the [Contributing Guide](CONTRIBUTING.md)

## Installation

* **eCommerce** it's splitted into two standalone RESTful API's, so you can run it on whatever port you want. Installing 
* **eCommerce** it's easy, the tutorial above will explain to you.



### Development

You can attach the .war in WebServers like **AWS** using the Management Interface.

If you want run the standalone `.First-Project` just download it, and open your CMD/Terminal and write:

**If you want RUN the Products API**

`npm Start`

**If you want RUN the Purchases API**

`npm run`


### Production

Production Environments are focused in being ready. That means, you just need execute the JS File.

In the Production Environment all eCommerce API's are configured to work with **MONGODB** in  database; **productsAPI** and **purchaseAPI** and to work with a default **username and password** combination:

**Note.:** Remember importing each SQL files, if using MySQL for Production. You can find them inside `products-api/src/main/sql/` and `purchase-api/src/main/sql/`

* **Username:** admin@gmail.com
* **Password:** 123456
* **Database:** MongoDB
* **Port:** 5000
