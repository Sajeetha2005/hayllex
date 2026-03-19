const mongoose = require('mongoose');
const Workflow = require('./models/Workflow');
const Step = require('./models/Step');

mongoose.connect('mongodb://localhost:27017/halleyx').then(async () => {
  try {
    // Create a complete test workflow with steps
    const testWorkflow = new Workflow({
      name: 'Complete Test Workflow',
      description: 'A complete workflow with steps for testing execution',
      status: 'Active'
    });
    
    await testWorkflow.save();
    console.log('Test workflow created with ID:', testWorkflow._id);
    
    // Create steps for the workflow
    const triggerStep = new Step({
      workflowId: testWorkflow._id,
      name: 'Start Trigger',
      type: 'Trigger',
      position: { x: 100, y: 100 },
      config: { description: 'Starting point of workflow' }
    });
    
    const actionStep = new Step({
      workflowId: testWorkflow._id,
      name: 'Process Data',
      type: 'Action',
      position: { x: 300, y: 100 },
      config: { 
        description: 'Process the incoming data',
        action: 'Add Field',
        fieldName: 'processed',
        fieldValue: 'true'
      },
      nextSteps: []
    });
    
    await triggerStep.save();
    await actionStep.save();
    
    // Update trigger step to point to action step
    triggerStep.nextSteps = [actionStep._id];
    await triggerStep.save();
    
    console.log('Test workflow with steps created successfully!');
    console.log('1. Trigger Step ID:', triggerStep._id);
    console.log('2. Action Step ID:', actionStep._id);
    console.log('You can now execute this workflow!');
    
    process.exit(0);
  } catch (err) {
    console.error('Error creating test workflow:', err);
    process.exit(1);
  }
}).catch(err => {
  console.error('Database connection error:', err);
  process.exit(1);
});
