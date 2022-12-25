const dotenv = require('dotenv');

process.on('uncaughtException',err =>{
    console.log(err.name, err.message);
    process.exit(1);
});


dotenv.config({path: './config.env'});
const app = require('./app');


//start the server
const port =  process.env.PORT || 3000
const server = app.listen(port,()=>{
    console.log(`app runnig on port ${port}...`);
});

process.on('unhandledRejection',err=>{
    console.log(err.name, err.message);
    server.close(()=>{
        process.exit(1);
    })
});