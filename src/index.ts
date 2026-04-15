// import 'newrelic';
// import express from "express";

// const app = express();

// app.get("/" , (req , res) => {
//     console.log("Route Hit !")
//     res.json({
//         message : "Hello From Get Endpoint"
//     })
// })

// app.listen(3000 , () => {
//     console.log("App is Listening On Port 3000")
// })


import winston from "winston";
const logger = winston.createLogger({
    level : 'info',
    format : winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.prettyPrint()
    ),
    transports : [
        new winston.transports.File({ filename : 'error.log',level : 'error' }),
        new winston.transports.File({ filename : 'combined.log' }),
        new winston.transports.Console()
    ]
})

logger.error(" Hello !")
logger.info(" Hello !")
logger.warn(" Hello !")