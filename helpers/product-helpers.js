const { promise, reject } = require('bcrypt/promises');
const { response } = require('express');
const async = require('hbs/lib/async');
const Razorpay = require('razorpay');
var instance = new Razorpay({
    key_id: 'rzp_test_LzENomul3uevEZ',
    key_secret: 'XR8HpjEDW4U4yk01pct2rnkA',
});
const paypal = require('paypal-rest-sdk');
paypal.configure({
    'mode': 'sandbox',
    'client_id': 'Af75DnFpVjrqCa9a-umcYLEmTvYvpXtPjkXz58KI5Ys6JoikhsrIpJruJZ9ssVYb51_9d4X80erZv4eG',
    'client_secret': 'ENxAvJ1jLE8G6mhr0q1sL2-qrGbEtsvVUYw4Doi2wtuMq_HQN7s6qh24rSI1KDfSoY2NTVK-z54btyKe'
})
var db = require('../config/connection')
var collection = require('../config/users');
const { resolve } = require('path');
var objectId = require('mongodb').ObjectId
module.exports = {
    addProduct: (product, callback) => {
        console.log(product);
        product.Price = parseInt(product.Price);
        // product.Stock=ParseInt(product.Stock);
        product.status = true;
        db.get().collection('products').insertOne(product).then((data) => {

            console.log(data);
            callback(true)


        })
    }, getAllProducts: () => {
        
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(product)
            console.log(product);
        })
    },
    deleteProduct: (productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectId(productId) }).then((response) => {
                resolve(response)
            })

        })
    },

     getProductDetails: (productId) => {
        return new Promise((resolve, reject) => {
            try{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(productId) }).then((product) => {
                console.log(product);
                resolve(product)
            })
        }catch(e){
            reject()

        }
        })
    },
    updateProduct: (productId, productDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION)
                .updateOne({ _id: objectId(productId) }, {
                    $set: {
                        Name: productDetails.Name,
                        catogaerys: productDetails.catogaerys,
                        Price: productDetails.Price,
                        Stock: productDetails.Stock,
                        Discription: productDetails.Discription

                    }
                }).then((response) => {
                    resolve()

                })
        })

    }, getAllUsers: () => {
        console.log("edsd");
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
            console.log(users);
        })

    }, addCatogaery: (catogaerys, callback) => {
        console.log(catogaerys);
        db.get().collection('catogaery').insertOne(catogaerys).then((data) => {
            console.log(data);
            callback(true)


        })
    }, getAllCatogaery: () => {
        console.log("007");
        return new Promise(async (resolve, reject) => {
            let catogaerys = await db.get().collection(collection.CATOGAERY_COLLECTION).find().toArray()
            resolve(catogaerys)
            // console.log(catogaerys);
        })
    },
    deleteCatogaery: (catId) => {
        console.log(catId);
        return new Promise((resolve, reject) => {

            db.get().collection(collection.CATOGAERY_COLLECTION).deleteOne({ _id: objectId(catId) }).then((response) => {
                resolve(response)
            })
        })

    },
    removeFromBox:(addressId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ADDRESS_COLLECTION).deleteOne({_id:objectId(addressId)}).then((response)=>{
                console.log(response);
                resolve(response)
            })
        })

    },
    getCatogaerysDetails: (catId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATOGAERY_COLLECTION).findOne({ _id: objectId(catId) }).then((catogaerys) => {
                resolve(catogaerys)
            })
        })
    },
    updatCatogaerys: (catId, catDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATOGAERY_COLLECTION)
                .updateOne({ _id: objectId(catId) }, {
                    $set: {
                        Name: catDetails.Name,
                        Catogaery: catDetails.Catogaery,
                    }
                }).then((response) => {
                    resolve()

                })
        })
    },
    Instock: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(id) }, { $set: { status: true, status: false } }).then((Instock) => {
                resolve(Instock)
                console.log(Instock);
            })

        })
    },
    outofStock: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(id) }, { $set: { status: false, status: true } }).then((outofStock) => {
                resolve(outofStock)
                console.log(outofStock);
            })

        })

    },
    getSingleProduct: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(id) }).then((data) => {
                resolve(data)
            }).catch(()=>{
                reject()
            })
        })
    },
    addToCart: (productId, userId) => {
        let proObj = {
            item: objectId(productId),
            quantity: 1,
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == productId)
                console.log(proExist);
                console.log('kukukkkkkkkkk666666666666666666666666');
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId), 'products.item': objectId(productId) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }
                    ).then(() => {
                        resolve()

                    })

                } else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) },
                        {
                            $push: { products: proObj }
                        }


                    ).then((data) => {
                        resolve(data);
                    })
                }

            } else {
                console.log('OOIUUUUUU');
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj],
                    coupon: 0


                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((data) => {
                    resolve(data)

                })
            }

        })
    },
    getCartProducts: (userId) => {
        // console.log("Commi11111111111111111111111111111111111111111111111111");
        // console.log(userId);
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                    }
                }, {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'products'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$products', 0] }
                    }
                }
            ]).toArray()
            // console.log(cartItems);
            resolve(cartItems)
        })
    },

    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    },
    changeProductQuantity: (details) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)

        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart) },
                        {
                            $pull: { products: { item: objectId(details.product) } }
                        }
                    ).then((response) => {
                        resolve({ removeProduct: true })
                    })
            } else {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                        {
                            $inc: { 'products.$.quantity': details.count }
                        }

                    ).then((response) => {
                        resolve({ status: true })

                    })
            }
        })
    },
    // getTotalAmount: (userId) => {
    //     return new Promise(async (resolve, reject) => {
    //         let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
    //             {
    //                 $match: { user: objectId(userId) }
    //             },
    //             {
    //                 $unwind: '$products'
    //             },
    //             {
    //                 $project: {
    //                     item: '$products.item',
    //                     quantity: '$products.quantity'
    //                 }
    //             }, {
    //                 $lookup: {
    //                     from: collection.PRODUCT_COLLECTION,
    //                     localField: 'item',
    //                     foreignField: '_id',
    //                     as: 'products'
    //                 }
    //             },
    //             {
    //                 $project: {
    //                     item: 1, quantity: 1, product: { $arrayElemAt: ['$products', 0] }
    //                 }
    //             },
    //             {
    //                 $group: {
    //                     _id: null,
    //                     total: { $sum: { $multiply: ['$product.quantity', '$product.Price'] } }
    //                 }

    //             }

    //         ]).toArray()
    //         console.log(total);
    //         resolve(total)
    //     })

    // },
    removeFromCart: (details) => {
        return new Promise((resolve, reject) => {

            db.get().collection(collection.CART_COLLECTION)
                .updateOne({ _id: objectId(details.cart) },
                    {
                        $pull: { products: { item: objectId(details.product) } }
                    }
                ).then((response) => {
                    resolve({ removeProduct: true })
                })
        })
    },
  
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                }, {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'products'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$products', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$product.Price'] } }


                    }
                }
            ]).toArray()
            if (total[0]) {
                resolve(total[0].total)

            } else {
                resolve(0)
            }


        })
    },
    getTotal: (orderId) => {
        return new Promise((resolve, reject) => {
            console.log(orderId);
            db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(orderId) }).then((response) => {
                console.log(response);
                resolve(response)

            })
        })

    },

    placeOrder: (address, product, total, paymentmethod) => {
        return new Promise((resolve, reject) => {
            console.log("777777777777777777777777777777777777777");
            console.log(paymentmethod);
            console.log(address);
            console.log(total, product, address);

            console.log("kakakakkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkksdsadasdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
            let status = paymentmethod === 'COD' ? 'Placed' : 'pending'
            var date = new Date()
            var month = date.getUTCMonth() + 1
            var day = date.getUTCDate()
            var year = date.getUTCFullYear()
            let orderObj = {
                deliveryDetails: {
                    Name: address.address.First,
                    Address: address.address.Addrers,
                    Pincode: address.address.Pincode,
                    Mobile: address.address.Phone,
                    Email: address.address.Email,
                },
                userId: objectId(address.user),
                PaymentMethod: paymentmethod,
                products: product,
                Amount: total,
                date: day + "/" + month + "/" + year,
                status: status,

            }

            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                console.log(address);
                console.log("----------------------------------------------------");
                console.log(address.user);
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(address.user) })
                resolve(response.insertedId)
            })


        })

    },
    getCartProductList: (userId) => {

        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            console.log(cart);
            if(cart){
                resolve(cart.products)
            }
            
        })
    },
    getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: objectId(userId) }).sort({ _id: -1 })
                .toArray()
            
            console.log(orders);
            resolve(orders)
        })

    },
    getOrderProducts: (orderId) => {
      
        
        return new Promise(async (resolve, reject) => {
            try{
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',


                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()
            console.log(orderItems);
            resolve(orderItems)
            
        }catch(e){
            reject()
        }
    
        })
   

    },
    cancelOrderList: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(id) }, { $set: { status: false } }).then((cancel) => {
                resolve(cancel)
                console.log(cancel);
            })

        })

    },
    getAllReport: () => {
        return new Promise(async (resolve, reject) => {
            let sales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        deliveryDetails: '$deliveryDetails',
                        PaymentMethod: '$PaymentMethod',
                        Amount: '$Amount',
                        date: '$date',
                        status: '$status'





                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }

                },
                {
                    $project: {
                        deliveryDetails: 1, Amount: 1, date: 1, status: 1,
                        PaymentMethod: 1, item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }

                }
            ]).toArray()
            console.log(sales);
            resolve(sales)
        })

    },
    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            console.log("jjjjjjjjjjjjj");
            let orderss = await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
            console.log(orderss);
            resolve(orderss)
        })
    },
    addCoupon: (coupon) => {
        console.log(coupon);
        coupon.DiscountPrice = parseInt(coupon.DiscountPrice);
        db.get().collection('coupon').insertOne(coupon).then((data) => {
            console.log(data);



        })
    },
    getAllCoupon: () => {
        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
            resolve(coupon)
        })

    },
    addToWhishlist: (productId, userId) => {
        let proObj = {
            item: objectId(productId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.WISH_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == productId)
                console.log(proExist);
                console.log('kukukkkkkkkkk666666666666666666666666');
                if (proExist != -1) {
                    db.get().collection(collection.WISH_COLLECTION).updateOne({ user: objectId(userId), 'products.item': objectId(productId) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }
                    ).then(() => {
                        resolve()

                    })

                } else {
                    db.get().collection(collection.WISH_COLLECTION).updateOne({ user: objectId(userId) },
                        {
                            $push: { products: proObj }
                        }


                    ).then((data) => {
                        resolve(data);
                    })
                }

            } else {
                console.log('OOIUUUUUU');
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.WISH_COLLECTION).insertOne(cartObj).then((data) => {
                    resolve(data)

                })
            }

        })
    },
    getWishList: (userId) => {
        // console.log("Commi11111111111111111111111111111111111111111111111111");
        // console.log(userId);
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.WISH_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                    }
                }, {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'products'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$products', 0] }
                    }
                }
            ]).toArray()
            // console.log(cartItems);
            resolve(cartItems)
        })
    },
    removeFromWishList: (details) => {
        return new Promise((resolve, reject) => {

            db.get().collection(collection.WISH_COLLECTION)
                .updateOne({ _id: objectId(details.wishList) },
                    {
                        $pull: { products: { item: objectId(details.product) } }
                    }
                ).then((response) => {
                    resolve({ removeProduct: true })
                })
        })
    },
    generateRazorpay: (orderId, total) => {
        console.log(orderId);
        return new Promise((resolve, reject) => {
            var options = {
                amount: total * 100,
                currency: "INR",
                receipt: "" + orderId
            };
            instance.orders.create(options, function (err, order) {
                console.log("New Orders :", order);
                resolve(order)
            })


        })

    },
    generatePaypal: (orderId, total) => {
        return new Promise((resolve, reject) => {
            const create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http://localhost:3000/success",
                    "cancel_url": "http://localhost:3000/cancel"
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": "Magical Spirits",
                            "sku": "001",
                            "price": total,
                            "currency": "USD",
                            "quantity": 1
                        }]
                    },
                    "amount": {
                        "currency": "USD",
                        "total": total
                    },
                    "description": "Hat for the best team ever"
                }]
            };

            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    throw error;
                } else {
                    resolve(payment)
                    // for(let i = 0;i < payment.links.length;i++){
                    //   if(payment.links[i].rel === 'approval_url'){
                    //     res.redirect(payment.links[i].href);
                    //   }
                    // }
                }
            });

        });
    },

    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', 'XR8HpjEDW4U4yk01pct2rnkA')

            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }


        })
    },
    chagePayementStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            console.log("khhfu666666666666666666666666666666666666666666");
            console.log(orderId);
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
                {
                    $set: {
                        status: 'Placed'
                    }
                }
            ).then(() => {
                resolve()
            })
        })
    },
    deleteCoupon: (couponId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).deleteOne({ _id: objectId(couponId) }).then((response) => {
                resolve(response)
            })

        })
    },
    checkCoupon: (code, userId) => {
        return new Promise(async (resolve, reject) => {
            let check = await db.get().collection(collection.COUPON_COLLECTION).findOne({ Name: code })

            if (check) {
                let usercoupon = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) })

                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId), coupon: code })
                if (user) {
                    resolve({ status: 'Already Used' })
                } else if (usercoupon.coupon) {
                    let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
                    if (cart.coupon) {
                        resolve({ status: 'only one' })
                    } else {
                        db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
                            $push: { coupon: code }

                        })
                        db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) }, {
                            $set: {
                                coupon: code,
                                coupondiscount: check.DiscountPrice
                            }
                        })
                        resolve({ status: 'true' })

                    }

                } else {

                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) }, {
                        $set: {
                            coupon: code,
                            coupondiscount: check.DiscountPrice
                        }
                    })
                    db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
                        $set: {
                            coupon: [code]
                        }
                    })
                    resolve({ status: 'true' })
                }
            } else {
                resolve({ status: false })
            }
        })
    },
    checkCartcoupon: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                resolve(cart)

            } else {
                resolve(0)
            }


        })
    },
    getAllPaymentAmount: () => {
        return new Promise(async (resolve, reject) => {
            let AllPayment = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $group: {
                        _id: null,
                        totals: {
                            $sum: "$Amount"

                        }
                    },
                }
            ]).toArray()
            if (AllPayment[0]) {
                console.log(AllPayment)
                resolve(AllPayment[0].totals)

            } else {
                resolve(0)
            }

        })
    },
    getAllRazorpayPayment: () => {
        return new Promise(async (resolve, reject) => {
            let RazorpayPayment = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        PaymentMethod
                            : 'OnlinePyament'
                    }
                },
                {
                    $group: {
                        _id: null,
                        totals: {
                            $sum: "$Amount"
                        }
                    }
                }
            ]).toArray()
            if (RazorpayPayment[0]) {
                resolve(RazorpayPayment[0].totals)

            } else {
                resolve(0)
            }


        })
    },
    getAllPaypalPayment: () => {
        return new Promise(async (resolve, reject) => {
            let PaypalPayment = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        PaymentMethod
                            : 'Paypal'
                    }
                },
                {
                    $group: {
                        _id: null,
                        totals: {
                            $sum: "$Amount"
                        }
                    }
                }
            ]).toArray()
            if (PaypalPayment[0]) {
                console.log(PaypalPayment);
                resolve(PaypalPayment[0].totals)

            } else {
                resolve(0)
            }

        })
    },
    getAllCodPayment: () => {
        return new Promise(async (resolve, reject) => {
            let CodPayment = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        PaymentMethod
                            : 'COD'

                    }
                },
                {
                    $group: {
                        _id: null,
                        totals: {
                            $sum: "$Amount"
                        }
                    }

                }
            ]).toArray()
            if (CodPayment[0]) {
                console.log(CodPayment);
                resolve(CodPayment[0].totals)

            } else {
                resolve(0)
            }

        })
    },
    addAddress: (address, userId) => {
        console.log(address);
        let addId = {
            user: objectId(userId),
            address: address
        }


        db.get().collection('address').insertOne(addId).then((data) => {
            console.log(data);



        })
    },
    getAllAddress: (userId) => {
        console.log(userId);
        return new Promise(async (resolve, reject) => {
            let addres = await db.get().collection(collection.ADDRESS_COLLECTION).find({ user: objectId(userId) }).toArray()
            console.log(addres);
            resolve(addres)
        })
    },
    getAddress: (addressId) => {
        console.log("555555555555555555555555555555555555555555555555");
        console.log(addressId);
        return new Promise(async (resolve, reject) => {
            let adde = await db.get().collection(collection.ADDRESS_COLLECTION).findOne({ _id: objectId(addressId) })
            console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
            console.log(adde);
            resolve(adde)
        })

    }
}

