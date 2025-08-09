const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8070;

// ✅ CORS configuration (must be FIRST middleware)
const allowedOrigins = [
    "http://localhost:3000",              // Local development
    "https://newsweb-frontend.vercel.app" // Your production frontend
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE"
}));

// ✅ Handle preflight requests for all routes
app.options("*", cors({
    origin: allowedOrigins,
    credentials: true
}));

// Body parser
app.use(bodyParser.json());

// MongoDB connection
const URL = process.env.MONGODB_URL;
mongoose.connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000
})
.then(() => console.log("Mongodb Connection Success!"))
.catch((err) => console.error("Mongodb Connection Failed: ", err));

// Routes
const newsRoutes = require("./routes/newsRoutes.js");
app.use("/news", newsRoutes);

const userRouter = require("./routes/users.js");
app.use("/users", userRouter);

// Start server
app.listen(PORT, () => {
    console.log(`Server is up and running on port number: ${PORT}`);
});
