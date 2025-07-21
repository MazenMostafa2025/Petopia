const elasticClient = require('./utils/elasticsearch');
const mongoose = require('mongoose');
const dotenv = require('dotenv');


dotenv.config({ path: './config.env' });
const app = require('./app');
    
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log('DB connection successful!'));

// Test Elasticsearch connection on startup
elasticClient.ping()
  .then(() => console.log('Elasticsearch connected!'))
  .catch((err) => console.error('Elasticsearch connection failed:', err));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

