require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/route");

const app = express();


/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

app.use(cors({
    origin: *, // allow everyone just for our projects process.env.CLIENT_URL
    credentials: true
}));


/*
|--------------------------------------------------------------------------
| BODY PARSER
|--------------------------------------------------------------------------
*/

app.use(express.json());


/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);


/*
|--------------------------------------------------------------------------
| SERVER
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `Server is running on port ${PORT}`
    );

    console.log(
        `Client URL: ${process.env.CLIENT_URL}`
    );

});