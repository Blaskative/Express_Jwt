require("dotenv").config();
var express = require("express");
var cors = require("cors");
var app = express();
const jwt = require("jsonwebtoken");
const { nextTick } = require("process");

app.use(express.json());

app.use(cors());

const posts = [
  {
    username: "Kayle",
    title: "Post1",
  },
  {
    username: "Morgana",
    title: "Post2",
  },
];
const users = [
  {
    username: "Kayle",
    password: "gorditagordita13",
    roles: [2001]
  },
  {
    username: "Blaskative",
    password: "ringoringo13",
    roles: [5150]
  },
];
let refreshTokens = [];

app.post("/token", (req, res) => {
  const refreshToken = req.body.token;

  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshToken.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accesToken = generateAccesToken({ name: user.name });
    res.json({ accesToken: accesToken });
  });
});

app.get("/posts", authenticateToken, (req, res) => {
  res.json(posts.filter((post) => post.username === req.user.name));
});

app.delete("logout", (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token != req.body.token);
  res.sendStatus(204);
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const user = { name: username, password:password };
  let roles;
  
  let isFound = users.some(element => {
    if (element.username == user.name && element.password == user.password){
      roles= element.roles;
      return true;
    }
    return false;
  });
  if(!isFound) return  res.sendStatus(403);

  const accesToken = generateAccesToken(user);
  const refreshToken = generateRefreshAcessToken(user);
  console.log(roles);
  refreshTokens = [...refreshToken];
  res.json({ accesToken: accesToken, refreshToken: refreshToken, roles:roles });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCES_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function generateAccesToken(user) {
  return jwt.sign(user, process.env.ACCES_TOKEN_SECRET, { expiresIn: "1m" });
}
function generateRefreshAcessToken(user){
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
}

app.listen(4000, () => {
  console.log("Server started on port 4000");
});
