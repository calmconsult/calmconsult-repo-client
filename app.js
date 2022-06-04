// if (process.env.NODE_ENV !== "production") {
// }
require("dotenv").config({ path: "./.env" });
const express = require("express"),
  path = require("path"),
  Content = require("./models/content"),
  Cartegory = require("./models/cartegories"),
  User = require("./models/user"),
  ejsmate = require("ejs-mate"),
  mongoose = require("mongoose"),
  { v4: uuid } = require("uuid"),
  { isLoggedIn } = require("./middlewear/middlewares"),
  methodOverride = require("method-override"),
  appError = require("./utils/appError"),
  asyncWrapper = require("./utils/asyncWrapper"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  expressSsession = require("express-session"),
  multer = require("multer"),
  multerS3 = require("multer-s3"),
  { S3 } = require("aws-sdk/"),
  flash = require("connect-flash"),
  favicon = require("serve-favicon");

const app = express();

const s3 = new S3({
  accessKeyId: process.env.AmazonS3_Access_Key_ID,
  secretAccessKey: process.env.AmazonS3_Secret_Access_Key,
});

const uploaddocument = multer({
  storage: multerS3({
    s3: s3,
    bucket: "calmconsult-repository",
    // acl: "public-read",
    metadata: function (req, file, cb) {
      const filePath = `${uuid()}-${file.originalname}`;
      cb(null, { fieldName: filePath });
    },
    key: function (req, file, cb) {
      const filePath = `${uuid()}-${file.originalname}`;
      cb(null, filePath);
    },
  }),
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(methodOverride("_method"));
app.use(favicon(__dirname + "/public/images/favicon.png"));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  expressSsession({
    secret: "calm not secret",
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true }
  })
);
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
  res.locals.currUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

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

const cutSt = (documents) => {
  documents.map((el) => {
    let dcString = el.abstract;
    let maxlength = 223;
    if (dcString.length > maxlength) {
      let trimmedString = dcString.substring(0, maxlength);
      trimmedString = trimmedString.substring(
        0,
        Math.min(trimmedString.length, trimmedString.lastIndexOf(" "))
      );
      el.abstract = trimmedString + " ...";
    }
    return el;
  });
  return documents;
};

app.get(
  "/",
  asyncWrapper(async (req, res) => {
    let recentlyAdded = await Content.find({ accessRestriction: "public" })
      .sort({ dateAdded: -1 })
      .limit(7);
    cutSt(recentlyAdded);
    let alldocs = await Content.find({ accessRestriction: "public" });
    const authors = [...new Set(alldocs.map((el) => el.authors))];
    const collections = [...new Set(alldocs.map((el) => el.collections))];

    res.render("home", {
      recentlyAdded,
      currPage: "home",
      authors,
      collections,
    });
  })
);
app.get("/calmconsult/register", (req, res) => {
  res.render("user/register", { currPage: "register" });
});

app.post(
  "/calmconsult/login",
  passport.authenticate("local", {
    failureRedirect: "/",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", `you are logged in as ${req.user.username}`);
    res.redirect(req.headers.referer);
  }
);

app.post(
  "/calmconsult/register",
  asyncWrapper(async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      const registerUser = new User({ username, email });
      const registeredUSer = await User.register(registerUser, password);
      req.login(registeredUSer, (err) => {
        if (err) return next(err);
        req.flash("success", "you are logged in");
        res.redirect("/");
      });
    } catch (error) {
      res.render("user/register", {
        currPage: "register",
        errormsg: error.message,
      });
    }
  })
);

app.get("/calmconsult/logout", isLoggedIn, (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.get("/repositoryadmin/add", isLoggedIn, (req, res) => {
  res.render("content/addcontent", { currPage: "adddocument" });
});
app.post(
  "/repositoryadmin/add",
  isLoggedIn,
  uploaddocument.single("uploadedDocument"),
  asyncWrapper(async (req, res) => {
    let { authors: author, collections: collection } = req.body;
    const { file } = req;
    console.log(file);
    author = author.split(",");
    collection = collection.split(",");

    const newContent = new Content({
      ...req.body,
      contentUrl: file.location,
      contentKey: file.key,
    });

    let cartegories = await Cartegory.find();
    if (!cartegories.length) {
      let authors = {};
      let collections = {};
      for (const auth of author) {
        authors[auth] = 1;
      }
      for (const collect of collection) {
        collections[collect] = 1;
      }
      await Cartegory.create({ authors, collections });
    } else {
      let { authors, collections } = cartegories[0];
      let newCollections = { authors: {}, collections: {} };
      for (const auth of author) {
        authors[auth]
          ? (authors[auth] = authors[auth] + 1)
          : (authors[auth] = 1);
      }
      for (const coll of collection) {
        collections[coll]
          ? (collections[coll] = collections[coll] + 1)
          : (collections[coll] = 1);
      }
      newCollections.authors = authors;
      newCollections.collections = collections;
      await Cartegory.findByIdAndUpdate(cartegories[0].id, {
        ...newCollections,
      });
    }

    await newContent.save();
    req.flash("success", "document added");
    res.redirect("/");
  })
);
app.get(
  "/calmconsultdocuments/:id",
  asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const document = await Content.findById(id);
    res.render("content/single", { document, id, currPage: "singledocument" });
  })
);
app.get(
  "/:cartegories",
  asyncWrapper(async (req, res) => {
    const { cartegories } = req.params;
    let data = await Content.find({ accessRestriction: "public" });
    if (cartegories === "authors") {
      data = [...new Set(data.map((el) => el.authors))];
    } else {
      data = [...new Set(data.map((el) => el.collections))];
    }

    let recentlyAdded = await Content.find().sort({ dateAdded: -1 }).limit(6);
    cutSt(recentlyAdded);

    res.render("content/cartegories", {
      data,
      currPage: cartegories,
      recentlyAdded,
    });
  })
);

app.get(
  "/calmconsult/repoitorysearch/:page",
  asyncWrapper(async (req, res) => {
    let page = Number(req.query.page || 1);
    const { query, searchMode } = req.query;

    let documents;
    let totalItems;
    if (searchMode === "authors" || searchMode === "collections") {
      documents = await Content.find({
        searchMode: {
          $text: { $search: query },
        },
      });
      totalItems = await Content.find({
        searchMode: {
          $text: { $search: query },
        },
      }).countDocuments();
    } else {
      documents = await Content.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } }
      ).sort({ score: { $meta: "textScore" } });
      totalItems = await Content.find({
        $text: { $search: query },
      }).countDocuments();
    }
    documents = documents.slice((page - 1) * 10, page * 10);
    cutSt(documents);
    let perPage = 10;
    let pages = Math.ceil(totalItems / perPage);
    const totalpages = page + 3 >= pages ? pages : page + 3;

    res.render("content/searchResults", {
      documents,
      searchMode,
      query,
      totalItems,
      page,
      pages,
      totalpages,
      currPage: "search results",
    });
  })
);

app.get(
  "/:cartegories/:singleCategory",
  asyncWrapper(async (req, res) => {
    let page = Number(req.query.page || 1);
    let documents;
    let totalItems;
    const { cartegories, singleCategory } = req.params;
    let data = await Content.find({ accessRestriction: "public" });
    if (cartegories === "authors") {
      data = [...new Set(data.map((el) => el.authors))];
    } else {
      data = [...new Set(data.map((el) => el.collections))];
    }

    const findsiglecartegory = { $regex: singleCategory, $options: "i" };
    if (cartegories === "authors") {
      documents = await Content.find({
        authors: findsiglecartegory,
      }).sort({
        dateAdded: -1,
      });
      totalItems = await Content.find({ authors: singleCategory })
        .sort({ dateAdded: -1 })
        .countDocuments();
    }
    if (cartegories === "collections") {
      documents = await Content.find(
        {
          $text: { $search: singleCategory },
        },
        { score: { $meta: "textScore" } }
      ).sort({ score: { $meta: "textScore" } });
      totalItems = await Content.find({ collections: singleCategory })
        .sort({ dateAdded: -1 })
        .countDocuments();
    }

    documents = documents.slice((page - 1) * 10, page * 10);
    cutSt(documents);
    let perPage = 10;
    let pages = Math.ceil(totalItems / perPage);
    const totalpages = page + 3 >= pages ? pages : page + 3;
    res.render("content/singleCategory", {
      data,
      page,
      totalpages,
      totalItems,
      pages,
      documents,
      currPage: singleCategory,
      cartegories,
      id: "",
    });
  })
);

app.get(
  "/calmconsultdocuments/:id/edit",
  isLoggedIn,
  asyncWrapper(async (req, res) => {
    const document = await Content.findById(req.params.id);
    res.render("content/editcontent", { currPage: "editdocument", document });
  })
);

app.put(
  "/calmconsultdocuments/:id/edit",
  isLoggedIn,
  asyncWrapper(async (req, res) => {
    const { id } = req.params;
    let { authors: author, collections: collection } = req.body;
    author = author.split(",");
    collection = collection.split(",");
    await Content.findByIdAndUpdate(id, {
      ...req.body,
    });
    res.redirect("/");
  })
);

app.get(
  "/calmconsult/repoitory/alldocuments",
  asyncWrapper(async (req, res) => {
    let page = Number(req.query.page || 1);
    const totalItems = await Content.find().countDocuments();
    let documents = await Content.find()
      .limit(10)
      .skip((page - 1) * 10);
    let perPage = 10;
    let pages = Math.ceil(totalItems / perPage);
    // let startFrom = (page - 1) * perPage;
    const totalpages = page + 3 >= pages ? pages : page + 3;
    cutSt(documents);
    res.render("content/alluploadeddocuments", {
      currPage: "alldocuments",
      documents,
      pages,
      totalpages,
      page,
      totalItems,
      id: "",
    });
  })
);

app.delete(
  "/calmconsultdocuments/:id/delete",
  isLoggedIn,
  asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const document = await Content.findById(id);
    const params = {
      Bucket: "calmconsult-repository",
      Key: document.contentKey,
    };
    s3.deleteObject(params, function (err, data) {
      if (err) console.log(err, err.stack);
    });
    await Content.findByIdAndDelete(id);
    req.flash("success", "document deleted");
    res.redirect("/");
  })
);

app.all("*", (req, res, next) => {
  next(new appError(404, "The page was not found"));
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Something went wrong" } = err;
  res.status(status).send(message);
});
