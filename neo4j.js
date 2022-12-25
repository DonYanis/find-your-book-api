const neo4j = require('neo4j-driver');

const uri = process.env.DATABASE_URL;
const username = process.env.DATABASE_USERNAME;
const password = process.env.DATABASE_PASSWORD;

const driver = neo4j.driver(
    uri,
    neo4j.auth.basic(
      username,
      password
    )
  );

driver.verifyConnectivity()
    .then(()=>{console.log("connection OK !")})
    .catch(err =>{console.log("connection error")});


module.exports = driver;