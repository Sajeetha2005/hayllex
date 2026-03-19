const mongoose = require('mongoose');
const Orders = require('./models/Orders');

mongoose.connect('mongodb://localhost:27017/halleyx').then(async () => {
  try {
    const orders = await Orders.find({});
    console.log('Total orders:', orders.length);
    
    if (orders.length === 0) {
      console.log('No orders found. Creating sample orders...');
      const sampleOrders = [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+1-555-0101',
          product: 'Fiber Internet 300 Mbps',
          quantity: 1,
          unitPrice: 49.99,
          totalAmount: 49.99,
          country: 'United States',
          creator: 'Mr. Michael Harris',
          status: 'Active'
        },
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          phone: '+1-555-0102',
          product: '5G Unlimited Mobile Plan',
          quantity: 2,
          unitPrice: 39.99,
          totalAmount: 79.98,
          country: 'Canada',
          creator: 'Ms. Olivia Carter',
          status: 'Active'
        }
      ];
      
      await Orders.insertMany(sampleOrders);
      console.log('Sample orders created successfully!');
    } else {
      console.log('Sample order:', orders[0]);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}).catch(err => {
  console.error('Database connection error:', err);
  process.exit(1);
});
