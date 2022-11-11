const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const User = require("./models/user");
const bcrypt = require("bcrypt");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.json()); // Recover the post request in json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: process.env.AUDIENCE }));

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "sessionss",
    cookie: {
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 Year
      sameSite: "none",
      httpOnly: true,
      secure: true,
    },
  })
);

const path = require("path");

mongoose
  .connect(
    "mongodb+srv://" +
      process.env.DB_USER +
      ":" +
      process.env.DB_PASSWORD +
      "@" +
      process.env.DB_SERVER +
      "?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use((req, res, next) => {
  helmet({
    crossOriginEmbedderPolicy: false,
  });

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000"); // req.headers.origin
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.setHeader(
    "Content-Security-Policy",
    "script-src 'self' https://apis.google.com"
  ); // Si je dis pas de connerie on défini ici les stripts externes autorisés ?
  next();
});

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");
const refreshRoutes = require("./routes/refresh");

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/", express.static(path.join(__dirname, "./public")));
app.use("/api/posts", postRoutes);
app.use("/api", refreshRoutes);

User.findOne({ email: process.env.ADMIN_DEFAULT_EMAIL }).then((user) => {
  if (!user) {
    // If the first admin is not already created
    bcrypt
      .hash(process.env.ADMIN_DEFAULT_PASSWORD, 10) // Encrypt the password
      .then((hash) => {
        const user = new User({
          firstName: "Admin",
          lastName: "Admin",
          email: process.env.ADMIN_DEFAULT_EMAIL,
          password: hash,
          roles: 50, // Admin User
        });
        user.save();
      });
  }
});

module.exports = app;
