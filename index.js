import 'dotenv/config'

import express from 'express';
import multer from 'multer';
import path from 'path';

import EfiPay from "sdk-node-apis-efi"
// const options = require('../../credentials')
import options from "./credentials/credentials.js"

const upload = multer();
const app = express();
app.set('view engine', 'ejs');

app.use('/public', express.static('public'))

app.get("/", async(req, res) => {
  const product = JSON.parse(req.query.product);
  const productName = product.name;
  const productPrice = product.price * 100;
  const productAmount = product.amount;

  const shipping = JSON.parse(req.query.shipping);
  const shippingName = shipping.name;
  const shippingPrice = shipping.price * 100;
  let shippings = []
  if(shippingName && shippingPrice) {
    shippings[0] = {
      name: shippingName,
      value: shippingPrice,
    }
  }

  const efipay = new EfiPay(options);
  let createOneStepLinkConfig = {
    settings: {
      billet_discount: 1,
      message: 'Paga ai seu corno',
      expire_at: '2024-12-01',
      request_delivery_address: false,
      payment_method: 'all',
    },
    items: [
      {
        name: productName,
        value: productPrice,
        amount: productAmount,
      },
    ],
    shippings: shippings
  }

  const oneStepLink = await efipay.createOneStepLink({}, createOneStepLinkConfig)
    .then((response) => {
      return response;
    })
    .catch(err => {
      console.log(err)
    })

  res.render("pages/index", { paymentLink: oneStepLink.data.payment_url })
})

app.listen(3000, () => console.log('Servidor iniciado na porta 3000'));