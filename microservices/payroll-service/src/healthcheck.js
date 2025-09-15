const curl = require('curl');

const healthcheck = () => {
  return new Promise((resolve, reject) => {
    curl.get('http://localhost:3004/health', (err, response) => {
      if (err) {
        reject(err);
      } else if (response.statusCode === 200) {
        resolve(response);
      } else {
        reject(new Error(`Health check failed with status ${response.statusCode}`));
      }
    });
  });
};

healthcheck()
  .then(() => {
    console.log('Health check passed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Health check failed:', error.message);
    process.exit(1);
  });
