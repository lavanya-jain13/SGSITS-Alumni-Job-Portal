const { exec } = require('child_process');
const path = require('path');

console.log('Running database seeds...');

exec('cd backend && npx knex seed:run', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Seeds completed: ${stdout}`);
});