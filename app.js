const express = require("express"),
  path = require("path"),
  Content = require("./models/content"),
  ejsmate = require("ejs-mate"),
  mongoose = require("mongoose"),
  { v4: uuid } = require("uuid"),
  app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
// app.use(favicon(__dirname + "/public/images/favicon.png"));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.engine("ejs", ejsmate);
app.set("vews", path.join(__dirname, "views"));

const port = process.env.PORT || 3000;
const DBURL = process.env.DBURL || "mongodb://localhost:27017/calmconsult";
mongoose.connect(DBURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

app.listen(port, () => console.log(`App listenning at port ${port}`));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/repositoryadmin/add", (req, res) => {
  res.render("content/addcontent");
});
