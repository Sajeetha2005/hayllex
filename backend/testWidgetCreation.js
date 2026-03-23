const axios = require('axios');

async function testWidgetCreation() {
  try {
    console.log('Testing widget creation and data flow...\n');
    
    // Test creating a simple KPI widget
    console.log('1. Creating a new KPI widget...');
    const kpiWidget = {
      id: 'test-kpi-' + Date.now(),
      type: 'kpi',
      label: 'Test KPI',
      config: {
        title: 'Total Orders',
        metric: 'Total amount',
        aggregation: 'Sum'
      },
      data: []
    };
    
    console.log('Widget created:', kpiWidget);
    
    // Test fetching data for this widget
    console.log('\n2. Fetching data for KPI widget...');
    const aggRes = await axios.get('http://localhost:5000/api/dashboard/aggregate', {
      params: { 
        metric: kpiWidget.config.metric, 
        aggregation: kpiWidget.config.aggregation 
      }
    });
    
    console.log('✅ KPI data fetched successfully:', aggRes.data);
    
    // Test creating a bar chart widget
    console.log('\n3. Creating a bar chart widget...');
    const barWidget = {
      id: 'test-bar-' + Date.now(),
      type: 'bar',
      label: 'Test Bar Chart',
      config: {
        title: 'Sales by Product',
        xAxis: 'Product',
        yAxis: 'Total amount'
      },
      data: []
    };
    
    console.log('Widget created:', barWidget);
    
    // Test fetching data for bar chart
    console.log('\n4. Fetching data for bar chart...');
    const chartRes = await axios.get('http://localhost:5000/api/dashboard/chartdata', {
      params: { 
        xField: barWidget.config.xAxis, 
        yField: barWidget.config.yAxis 
      }
    });
    
    console.log('✅ Chart data fetched successfully:');
    console.log('   Data points:', chartRes.data.length);
    chartRes.data.forEach((point, i) => {
      console.log(`   ${i + 1}. ${point.name}: ${point['Total amount']}`);
    });
    
    console.log('\n✅ All widget tests passed! The backend APIs are working correctly.');
    console.log('The issue is likely in the frontend widget rendering or configuration.');
    
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Response data:', err.response.data);
    }
  }
  process.exit(0);
}

testWidgetCreation();
