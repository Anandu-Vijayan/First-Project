var db = require('../config/connection')
var collection = require('../config/users')
const bcrypt = require('bcrypt');
const { status } = require('express/lib/response');
const { promise, reject } = require('bcrypt/promises');
const { ObjectId } = require('mongodb');
const res = require('express/lib/response');
const async = require('hbs/lib/async');
module.exports = {
    doSignup: (userData) => {
        console.log(userData);
        return new Promise(async (resolve, reject) => {
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
            console.log(user,"userCheck");
            if(!user){
                userData.password = await bcrypt.hash(userData.password, 10)
                userData.status=true;
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                    resolve(data)
                    // console.log('FGDFGDGFDGDFGD');
                    // console.log(userData);
                })
            }else{
                reject()
            }
               
            })
        



    },
    doLogin:(userData)=>{
        console.log(userData);
        return new Promise(async(resolve,reject)=>{
            // let loginStatus=false
            let response={}
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
            if(user){
                if(user.status){
                    response.loginn=true
                }
            }
            if(user){
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status){
                        console.log("login success");
                        response.user=user
                        response.status=true
                        resolve(response)
 
                    }else{
                        console.log('login failed');
                        response.status=false
                        resolve(response)
                    }
                })

            }else{
                console.log('login failed');
                resolve({status:false})
            }
        })
        
    },
    blockUser:(id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(id)},{$set:{status:true,status:false}}).then((block) => {
                resolve(block)
                console.log(block);
            })

        })
    },
    unblockUser:(id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(id)},{$set:{status:false,status:true}}).then((unblock) => {
                resolve(unblock)
                console.log(unblock);
            })

        })
    },
    cancelorder:(id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(id)},{$set:{status:Placed,status:false}}).then((canceled) => {
                resolve(canceled)
                console.log(canceled);
            })

        })
    },
    changePassword:(id)=>{
        return new Promise(async(resolve,reject)=>{
            let data=await db.get().collection(collection.USER_COLLECTION).findOne({Email:id.Email})
            if(data){
             id.password=await bcrypt.hash(id.password, 10)
                db.get().collection(collection.USER_COLLECTION).updateOne({Email:id.Email},{$set:{password:id.password}}).then((response)=>{
                    resolve(response)
                })
            }
        })
    }

}
