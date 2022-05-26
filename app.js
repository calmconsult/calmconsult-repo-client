const express = require("express"),
  path = require("path"),
  Content = require("./models/content"),
  ejsmate = require("ejs-mate"),
  mongoose = require("mongoose"),
  { v4: uuid } = require("uuid"),
  appError = require("./utils/appError"),
  asyncWrapper = require("./utils/asyncWrapper"),
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

app.get(
  "/",
  asyncWrapper(async (req, res) => {
    const recentlyAdded = await Content.find({ accessRestriction: "public" })
      .sort({ dateAdded: -1 })
      .limit(10);
    res.render("home", { recentlyAdded });
  })
);

app.get("/repositoryadmin/add", (req, res) => {
  res.render("content/addcontent");
});
app.post(
  "/repositoryadmin/add",
  asyncWrapper(async (req, res) => {
    const newContent = new Content({
      ...req.body,
      authors: req.body.author.split(","),
      collections: req.body.collections.split(","),
      contentKey:
        "5df59fe3-d507-46d3-b989-2b77c151ae24-Abdulahi Abdi Isaac-Sustainable Provision of Digital Information Systems and Services in Academic Libraries A Case of the University of Nairobi Library System 2017.pdf",
      contentUrl:
        "https://asbatlibrary.s3.eu-central-1.amazonaws.com/5df59fe3-d507-46d3-b989-2b77c151ae24-Abdulahi%20Abdi%20Isaac-Sustainable%20Provision%20of%20Digital%20Information%20Systems%20and%20Services%20in%20Academic%20Libraries%20A%20Case%20of%20the%20University%20of%20Nairobi%20Library%20System%202017.pdf",
    });
    await newContent.save();
    console.log(req.body);
    res.redirect("/");
  })
);

app.get(
  "/calmconsultdocuments/:id",
  asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const document = await Content.findById(id);
    res.render("content/single", { document, id });
  })
);

app.all("*", (req, res, next) => {
  next(new appError(404, "The page was not found"));
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Something went wrong" } = err;
  res.status(status).send(message);
});
