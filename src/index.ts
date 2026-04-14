import 'newrelic';
import express from "express";

const app = express();

app.get("/" , (req , res) => {
    console.log("Route Hit !")
    res.json({
        message : "Hello From Get Endpoint"
    })
})

app.listen(3000 , () => {
    console.log("App is Listening On Port 3000")
})