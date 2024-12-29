const fs = require('fs');
const path = '/tmp/test-file.txt';

// Attempt to write a test file
fs.writeFile(path, 'This is a test file', (err) => {
    if (err) {
        return console.error('Cannot write to /tmp/:', err.message);
    }
    console.log('Successfully wrote to /tmp/');
    fs.unlinkSync(path); // Cleanup: Remove the test file
});
