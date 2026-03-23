const mongoose = require('mongoose');
const Workflow = require('./models/Workflow');

mongoose.connect('mongodb://localhost:27017/halleyx').then(async () => {
  try {
    const workflows = await Workflow.find({});
    console.log('Existing workflows:', workflows.length);
    
    if (workflows.length === 0) {
      console.log('No workflows found. Creating a test workflow...');
      const testWorkflow = new Workflow({
        name: 'Test Workflow',
        description: 'A simple test workflow for execution',
        status: 'Active'
      });
      await testWorkflow.save();
      console.log('Test workflow created with ID:', testWorkflow._id);
    } else {
      console.log('Available workflows:');
      workflows.forEach(w => {
        console.log(`- ${w.name} (ID: ${w._id})`);
      });
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
