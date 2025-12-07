const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
require("dotenv").config();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.status(200).json({ message: "Server is up and running!" });
});

// CORS configuration
app.use(cors({
    origin: [
        "http://localhost:3000",              // For local development
        "https://newsweb-frontend.vercel.app" // Your production Next.js URL
    ],
    credentials: true
}));

// app.use(cors());


app.use(bodyParser.json());

const URL = process.env.MONGODB_URL;

mongoose.connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds instead of 30 seconds
})
    .then(() => console.log("Mongodb Connection Success!"))
    .catch((err) => console.error("Mongodb Connection Failed: ", err));

const newsRoutes = require("./routes/newsRoutes.js");
app.use("/news", newsRoutes);

const userRouter = require("./routes/users.js");
app.use("/users", userRouter);

app.listen(PORT, () => {
    console.log(`Server is up and running on port number: ${PORT}`);
});
