const fetch = require('node-fetch');
const Order = require('./Order.js');

class OrderStream {

  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  async add(order) {
    let url = `${this.endpoint}/api/post`;
    let response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(order),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    let json = await response.json();
    return json;
  }

  async find(id) {
    let url = `${this.endpoint}/api/order/${id}`;

    let response  = await fetch(url);
    let json      = await response.json();

    let orderData = json[0];
    let order     = new Order(orderData.data);

    return order;
  }

}

module.exports = OrderStream;
