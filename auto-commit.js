const cron = require('node-cron');
const { exec } = require('child_process');

// Replace these values with your Git repository information
const repositoryPath = '/path/to/your/repo';
const commitMessage = 'Automated commit';

// Define the Git commands
const gitAdd = `git add score.json telebot.js linksObject.json`;
const gitCommit = `git  commit -m "${commitMessage}"`;
const gitPush = `git push`;

// Schedule the Git commands to run every 5 minutes
cron.schedule('*/1 * * * *', () => {
  // Run 'git add', 'git commit', and 'git push' commands in sequence
  exec(gitAdd, (error, stdout, stderr) => {
    if (error) {
      console.error('Error running git add:', error);
    } else {
      console.log('Files added to the Git staging area.');
      exec(gitCommit, (error, stdout, stderr) => {
        if (error) {
          console.error('Error running git commit:', error);
        } else {
          console.log('Changes committed to Git repository.');
          exec(gitPush, (error, stdout, stderr) => {
            if (error) {
              console.error('Error running git push:', error);
            } else {
              console.log('Changes pushed to remote repository.');
            }
          });
        }
      });
    }
  });
});
