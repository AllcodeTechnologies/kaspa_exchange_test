//module imports
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const createHttpError = require("http-errors");
const kaspaRoute = require("./routes/kaspa_route");

//app configurations
let app = express();
dotenv.config();
app.use(express.json());
app.use(morgan("tiny"));

app.use(express.urlencoded({ extended: false }));

// Configure CORS middleware with options
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      callback(new Error("Not allowed by CORS"));
    }
    callback(null, true);
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 204,
};

app.use(cors());

//app routes

let baseApi = "/api/v1";
app.use(`${baseApi}/kaspa`, kaspaRoute);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  console.log("Route Not Found");
  next(createHttpError(404, "Route not Found!"));
});

// error handler
app.use((error, req, res, next) => {
  console.log("error.message", error.message);
  return res.status(error.status || 500).json({
    status: false,
    message: error.message,
  });
});
///localhost:3000/api/v1
//start server
app.listen(process.env.PORT || 3000, function () {
  console.log("Express app running on port " + (process.env.PORT || 3000));
});
