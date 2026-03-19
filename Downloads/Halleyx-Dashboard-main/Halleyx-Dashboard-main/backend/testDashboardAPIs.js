const axios = require('axios');

async function testDashboardAPIs() {
  try {
    console.log('Testing dashboard API endpoints...\n');
    
    // Test orders endpoint
    console.log('1. Testing /api/orders...');
    try {
      const ordersRes = await axios.get('http://localhost:5000/api/orders');
      console.log('✅ Orders API works! Found', ordersRes.data.length, 'orders');
    } catch (err) {
      console.log('❌ Orders API failed:', err.message);
    }
    
    // Test aggregate endpoint
    console.log('\n2. Testing /api/dashboard/aggregate...');
    try {
      const aggRes = await axios.get('http://localhost:5000/api/dashboard/aggregate', {
        params: { metric: 'Total amount', aggregation: 'Sum' }
      });
      console.log('✅ Aggregate API works! Result:', aggRes.data);
    } catch (err) {
      console.log('❌ Aggregate API failed:', err.message);
    }
    
    // Test chart data endpoint
    console.log('\n3. Testing /api/dashboard/chartdata...');
    try {
      const chartRes = await axios.get('http://localhost:5000/api/dashboard/chartdata', {
        params: { xField: 'Product', yField: 'Total amount' }
      });
      console.log('✅ Chart data API works! Found', chartRes.data.length, 'data points');
      if (chartRes.data.length > 0) {
        console.log('Sample data point:', chartRes.data[0]);
      }
    } catch (err) {
      console.log('❌ Chart data API failed:', err.message);
    }
    
    // Test layout endpoint
    console.log('\n4. Testing /api/dashboard/layout...');
    try {
      const layoutRes = await axios.get('http://localhost:5000/api/dashboard/layout');
      console.log('✅ Layout API works! Layout:', layoutRes.data);
    } catch (err) {
      console.log('❌ Layout API failed:', err.message);
    }
    
  } catch (err) {
    console.error('Test failed:', err.message);
  }
  process.exit(0);
}

testDashboardAPIs();
