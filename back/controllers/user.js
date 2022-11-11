const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Security = require("./security");
const crypto = require("crypto");

function security(email, password) {
  if (!Security.mail(email))
    return "Security problem with the value of your mail";
  if (!Security.password(password))
    return "Incorrect password. He must have at least 1 number, 6 characters, uppercase letter, no space, and a maximum of 100 characters.";
  return false;
}

// Add a new user
exports.signup = (req, res, next) => {
  let err = security(req.body.email, req.body.password);
  if (err)
    return res.status(422).json({
      message: err,
    });
  bcrypt
    .hash(req.body.password, 10) // Encrypt the password
    .then((hash) => {
      const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hash,
        roles: 10, // Default User
      });
      user
        .save()
        .then(() =>
          res.status(201).json({ message: "User saved successfully !" })
        )
        .catch((message) => {
          console.log(message);
          res.status(409).json({ message });
        });
    })
    .catch((message) => res.status(500).json({ message }));
};

// Login the user
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.sendStatus(401); // If the email is not already recorded
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then(async (valid) => {
          if (!valid) {
            return res.sendStatus(401); // If the password is wrong
          }
          const xsrfToken = crypto.randomBytes(64).toString("hex");
          const roles = user.roles;
          const _id = user._id;
          const accessToken = jwt.sign(
            {
              UserInfo: {
                id: user._id,
                email: user.email,
                roles: roles,
                xsrfToken,
              },
            },
            process.env.ACCESS_TOKEN,
            {
              algorithm: process.env.ALGORITHM,
              audience: process.env.AUDIENCE,
              issuer: process.env.ISSUER,
              expiresIn: Number(process.env.EXPIRES_IN) / 1000,
              subject: user._id.toString(),
            }
          );
          /*
          const refreshToken = crypto.randomBytes(128).toString("base64");
          RefreshToken.create({
            userId: user._id,
            token: refreshToken,
            expiresAt: Date.now() + Number(process.env.REFRESH_EXPIRES_IN),
          });
          */
          const refreshToken = jwt.sign(
            { email: user.email },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_EXPIRES_IN }
          );

          user.refreshToken = refreshToken;
          await user.save();

          /* On créer le cookie contenant le JWT */
          (req.session.access_token = accessToken),
            {
              httpOnly: true,
              secure: true,
              maxAge: process.env.EXPIRES_IN,
            };

          /* On créer le cookie contenant le refresh token */
          (req.session.refresh_token = refreshToken),
            {
              httpOnly: true,
              secure: true,
              maxAge: Date.now() + Number(process.env.REFRESH_EXPIRES_IN),
              path: "/refresh",
            };

          /* On envoie tout de même une réponse JSON contenant les durées de vie des tokens */
          res.json({
            data: {
              xsrfToken,
              roles,
              _id,
              accessToken,
            },
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

// Get one user by params.id
exports.getById = (req, res, next) => {
  User.findOne({ _id: req.params.id })
    .then((user) => res.status(200).json(user))
    .catch((error) => res.status(404).json({ error }));
};
