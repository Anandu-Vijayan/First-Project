var express = require('express');
const helpers = require('handlebars-helpers');
// const { Client } = require('twilio/lib/twiml/VoiceResponse');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
var config=require('../config/otp')
var productHelper = require('../helpers/product-helpers')
const userHelpers = require('../helpers/user-helpers');
const async = require('hbs/lib/async');
const paypal =require('paypal-rest-sdk');
const { response } = require('express');
const { validateExpressRequest } = require('twilio/lib/webhooks/webhooks');
const { redirect } = require('express/lib/response');
const { payment } = require('paypal-rest-sdk');
const { checkCartcoupon, getUserOrders } = require('../helpers/product-helpers');
require('dotenv').config()
const SSID=process.env.serviceId
const ASID=process.env.accountSID
const AUID=process.env.authToken

const client = require("twilio")(ASID,AUID);

const verifylogin = (req, res, next) => {
  if (req.session.user) {
    next()
  } else {
    res.redirect('/login');
  }
};
router.get("/error",(req,res)=>{
  res.render("error")
})

/* GET home page. */
router.get('/',async function (req, res, next) {
  let loged = req.session.user
  let cartCount=null
  if(req.session.user){
   cartCount=await productHelpers.getCartCount(req.session.user._id)
   productHelpers.getAllProducts().then((product)=>{
    res.render('index', { user: true,product,loged, Error: req.session.Error,cartCount});
   })
   req.session.Error = false
  }else{
    productHelpers.getAllProducts().then((product)=>{
      res.render('index',{user:true,product})

    })
    

  }  
  
});

/*Login*/
router.get('/login', (req, res) => {

  if (req.session.user) {
    res.redirect('/')
  } else {

    res.render('login', { user: false, Error: req.session.Error })
    req.session.Error =  ""
  }

});
router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (!response.loginn) {
      req.session.Error = "Sorry you are Blocked"
      res.redirect('/login')
    }
     else if (response.status) {
      req.session.user = response.user
      console.log(response.user);
      res.redirect('/')

    } else {

      req.session.Error = "Invalid Username or Password"
      res.redirect('/login')
      
    }
  
  

  })


})
/*Logout*/
router.get('/logout', (req, res) => {
  req.session.user = false
  console.log('distroy');
  res.redirect('/')
})


/*signup*/
router.get('/signup', (req, res) => {
  let Err = req.session.loginErr
  if (!req.session.user) {
    let err = true;
    res.render('signup', { user: false, Err})
    req.session.loginErr = false
  } else {
    res.redirect('/')
  }

});
router.get('/otp',(req,res)=>{
  if(req.session.user){
    res.redirect('/login')
  }else{
    var num=req.session.phone
    res.render('otp',{num,er:req.session.Er_otp})
    req.session.Er_otp=false
  }
  
  
})

router.post('/signup', (req, res) => {

  userHelpers.doSignup(req.body).then((response) => {
    console.log(response);
    let number=req.body.phone_number
    req.session.userData=req.body
    req.session.phone=req.body.phone_number
    console.log(number);
    res.render('otp')
    client.verify.services(SSID).verifications.create({
      to:`+91${number}`,
      channel:"sms", 
    }).then((data)=>{
      console.log(data);
      console.log("line 40 data");

      res.redirect('/otp')
    })

   

  }).catch(() => {
    req.session.loginErr = "Entered user Existing"
    res.redirect('/signup')

  

  })





})
router.post('/otp',(req,res)=>{
  var otp=req.body.otp
  var number=req.session.phone

  client.verify.services(SSID).verificationChecks.create({
    to: `+91${number}`,
    code:otp,
  }).then((data)=>{
    console.log(data.status+"otp status???????");

    if(data.status=='approved'){
      userHelpers.doSignup(req.session.userData).then((response)=>{
        req.session.ok=true;
        res.redirect('/login')
      })
    }
    else{
      req.session.Er_otp='invalid otp'
      res.redirect('/otp')
    }
  })
  // userHelpers.doSignup(req.session.userData).then((response)=>{
  //   req.session.ok=true;
  //   res.redirect('/login')
  // })
})




router.get('/product',verifylogin, (req, res, next) => {
  let loged = req.session.user
  productHelpers.getAllProducts().then((product) => {
    res.render('product', { user: true, loged, product })
  })
})
router.get('/cart',verifylogin,async (req, res) => {
  let loged = req.session.user
  let products=await productHelpers.getCartProducts(req.session.user._id)
  console.log(req.session.user);
  let totalValue=await productHelpers.getTotalAmount(req.session.user._id)
  
  
  let GrandTotal=totalValue+120
  let checkCart=await productHelpers.checkCartcoupon(req.session.user._id)
  if(checkCart.coupon){
     netTotal=GrandTotal-checkCart.coupondiscount
     couponDis=checkCart.coupondiscount
  }else{
    netTotal=0
    couponDis=0

  }
  res.render('cart',{ user: true, loged,user:req.session.user,products,GrandTotal,totalValue,netTotal,couponDis})
  
})
 router.get('/add-to-cart/:id',verifylogin,async(req,res)=>{
   
  if(req.session.user){
    
   productHelpers.addToCart(req.params.id,req.session.user._id).then((response)=>{
    

    console.log("\nKKKKKKKKKK")
    res.redirect('/product')
   
   })
  }else{ 
    res.redirect('/')  
  } 
    
 })
 router.post('/change-product-quantity',(req,res,next)=>{
  
  console.log("helooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo");
   productHelpers.changeProductQuantity(req.body).then(async(response)=>{
    response.total=await productHelpers.getTotalAmount(req.body.user)
    response.GrandTotal=response.total+120
    res.json(response) 
 console.log(req.body);
   }) 
 })
router.get('/about',verifylogin, (req, res) => { 
  let loged = req.session.user
  res.render('about', { user: true, loged })
})
router.get('/blog',verifylogin, (req, res) => { 
  let loged = req.session.user
  res.render('blog', { user: true, loged })
})
router.get('/forgot',verifylogin,(req,res)=>{
  let loged = req.session.user
  res.render('forgot',loged)

})
router.post('/forgot',(req,res)=>{
  userHelpers.changePassword(req.body).then((response)=>{
    req.session.user=false
    res.redirect('/login')
  })
  
})
router.get('/product-single/:id',verifylogin, (req, res) => {
  let loged = req.session.user
  productHelpers.getSingleProduct(req.params.id).then((product)=>{
    res.render('product-single', { user: true, loged,product})

  }).catch(()=>{
    res.redirect('/error')
  })
 
})
router.post("/remove-from-cart",(req,res)=>{
  console.log('dsdd'+req.body.cart+" gg "+req.body.product);
  productHelpers.removeFromCart(req.body).then((response)=>{
    res.json(response)
    console.log("workingggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg");
  }) 
})
router.post("/remove-from-box",(req,res)=>{
  console.log("555555555555555");
  productHelpers.removeFromBox(req.body.address).then((response)=>{
    console.log(req.body.address);
    res.json(response)
  })
})
router.get('/checkout',verifylogin,async (req, res) => {
  
  console.log(req.body);
  let loged = req.session.user
  let total=await productHelpers.getTotalAmount(req.session.user._id)
  let GrandTotal=total+120
  
  console.log(GrandTotal);
  let checkCart=await productHelpers.checkCartcoupon(req.session.user._id)
  let addresses= await productHelpers.getAllAddress(req.session.user._id)
  console.log('hooooooooooooooooooooo');
  console.log(addresses);
  if(checkCart.coupon){
     netTotal=GrandTotal-checkCart.coupondiscount
     req.session.netTotal=netTotal
     
     console.log(req.session.netTotal);
     couponDis=checkCart.coupondiscount



  }else{
    netTotal=0
    
    req.session.netTotal=0
  }
  res.render('checkout', { user: true, loged ,total,GrandTotal,user:req.session.user,netTotal,couponDis,addresses})
})
router.post('/checkout',async(req,res)=>{

  console.log(req.body);
  let products=await productHelpers.getCartProductList(req.session.user._id)
  let GrandTotal=await productHelpers.getTotalAmount(req.session.user._id)
  let address=await productHelpers.getAddress(req.body.Address)
  
  
  
  let total=GrandTotal+120
  console.log(GrandTotal);
  
 
  console.log(req.session.netTotal);
  console.log("989579798589756759569666696++5556+5+5+5");
  
  if(req.session.netTotal){
    console.log("999999999999999999999999999999999999999999");
    console.log(address);
    productHelpers. placeOrder(address,products,req.session.netTotal,req.body.paymentmethod).then((orderId)=>{

      console.log("5555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555");
      console.log(req.body);
      console.log(orderId); 
      req.session.orderid=orderId
  
      let conform={ID:orderId,codSuccess:'COD'}
      console.log("jasbcasxcbhxzchbhzclvxcbx");
      console.log(req.body);
      if(req.body['paymentmethod']=='COD'){
        console.log('6565656565656565')
        console.log(conform.codSuccess)
        
        res.json(conform)  
  
      }else if(req.body['paymentmethod']=='OnlinePyament'){
        console.log('mutheeeeeeeee');
        productHelpers.generateRazorpay(orderId,req.session.netTotal).then((response)=>{
          console.log(response);
          response.codSuccess='razorpay'
          response.ID=orderId
          res.json(response)
  
        })
   
      }else{
        productHelpers.generatePaypal(orderId,req.session.netTotal).then((payment)=>{
          console.log(response);
          response.ID=orderId
          res.json(payment)
        })
      }
       
    
    })
    console.log(req.body);
  
    
   

  }else{
    productHelpers. placeOrder(address,products,total,req.body.paymentmethod).then((orderId)=>{
      console.log("4444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444");
      console.log(address);
      console.log(req.body.Address);
      console.log(req.body);
      console.log("000000000000000000000000000000000000000000000000000000");
      console.log(products);
      console.log(orderId); 
      req.session.orderid=orderId
  
      let conform={ID:orderId,codSuccess:'COD'}
      console.log("jasbcasxcbhxzchbhzclvxcbx");
      console.log(req.body);
      if(req.body['paymentmethod']=='COD'){
        console.log('6565656565656565')
        console.log(conform.codSuccess)
        
        res.json(conform) 
  
      }else if(req.body['paymentmethod']=='OnlinePyament'){
        console.log('mutheeeeeeeee');
        productHelpers.generateRazorpay(orderId,total).then((response)=>{
          console.log(response);
          response.codSuccess='razorpay'
          response.ID=orderId
          res.json(response)
  
        })
  
      }else{
        productHelpers.generatePaypal(orderId,total).then((payment)=>{
          console.log(response);
          response.ID=orderId
          res.json(payment)
        })
      }
      
    
    })
    console.log(req.body);
  
    
   
  }
  
})
router.get('/success',async (req, res) => {
  let total=await productHelpers.getTotal(req.session.orderid)
  console.log(total.Amount);
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  productHelpers.chagePayementStatus(req.session.orderid).then(()=>{
    console.log("Payment successfull");
  
  })
  

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD", 

            "total":total.Amount 
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log(JSON.stringify(payment));
        res.redirect('/order-success');
    }
});
});
router.get ('/order-success',verifylogin,(req,res)=>{
  let loged = req.session.user
  
  res.render('order-success',{user:true,loged})
  
    // res.redirect('/login')
  
  
}) 
router.get('/orders',verifylogin,(req,res)=>{
  let loged = req.session.user
  console.log(req.session.user._id);
  productHelpers.getUserOrders(req.session.user._id).then((orders)=>{
    
    console.log("000000000000000000000000000000000000000000000000000000");
    console.log(orders);
    console.log("888888888888888888888888888888888888888888");
    res.render('orders',{user:true,orders,loged})

  })
  
  
})
router.get('/view-order-products/:id',verifylogin,async(req,res)=>{
  try{
    let loged=req.session.user
  let products=await productHelpers.getOrderProducts(req.params.id)
  res.render('view-order-products',{user:req.session.user,user:true,loged,products})

  }catch(err){
    res.render('/error')
  }
  
})


 


router.get('/User',verifylogin, (req, res) => {
  let loged = req.session.user
  console.log(loged);

  res.render('User', { user: true, loged })
})

router.get('/contact',verifylogin, (req, res) => {
  let loged = req.session.user
  res.render('contact', { user: true, loged })
})
router.get('/otp',(req,res)=>{
  res.render('otp')
})
router.get('/cancelOrder/:id',(req,res)=>{
  productHelpers.cancelOrderList(req.params.id).then((cancel)=>{
    res.redirect('/orders')

  })

})


router.get('/wishlist',verifylogin,async(req, res) => {
  let loged = req.session.user
  console.log("sdasdfuksgdusdfgufdguidfiffsdf55555555555555555555555555555555555555");
  let product=await productHelpers.getWishList(req.session.user._id)
  console.log(product);
  res.render('whishList', { user: true, loged,product})
})
router.get('/add-to-wishlist/:id',verifylogin,(req,res)=>{
  productHelpers.addToWhishlist(req.params.id,req.session.user._id).then(()=>{
    res.redirect('/wishlist')
  })
 
})
router.post("/remove-from-Wishlist",(req,res)=>{
  console.log(req.body);
  console.log('dsdd'+req.body.wishList+" gg "+req.body.product);
  productHelpers.removeFromWishList(req.body).then((response)=>{
    res.json(response)
    console.log("workinkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk");
  }) 
})
router.get('/address',verifylogin,(req,res)=>{
  let loged=req.session.user

  res.render('address',{user:true,loged})
})
router.post('/address',async(req,res)=>{
  console.log("sdfdd8888888888888888888888888888888888888888888888888888888888888888888888888888");
  console.log(req.body);
  if(req.session.user){
    productHelpers.addAddress(req.body,req.session.user._id)
      res.redirect('/address')


  }else{
    res.redirect('/')
  }
 
  
})

router.post('/verify-Payment',(req,res)=>{
  console.log("pppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp");

  productHelpers.verifyPayment(req.body).then(()=>{
    console.log(req.body);
    productHelpers.chagePayementStatus(req.body['order[receipt]']).then(()=>{
      console.log("Payment successfull");
      res.json({status:true})
    })

  }).catch((err)=>{
    console.log(err); 
    res.json({status:false,errMsg:''})
  })
}) 

router.get('/cancelsOrder/:id',(req,res)=>{
  productHelpers.cancelOrderList(req.params.id).then((cancel)=>{
    res.redirect('/admin/ordersList')

  })
})
router.post('/apply-coupon',(req,res)=>{

  productHelpers.checkCoupon(req.body.name,req.session.user._id).then((result)=>{
    res.json(result)
    
  })

})

  


module.exports = router;