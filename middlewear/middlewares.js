const Content = require("../models/content");

module.exports.isLoggedIn = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash(
      "error",
      "You need to be Logged in or have an account to do this"
    );
    return res.redirect("/");
  }
  next();
};

// module.exports.isOwner = async (req, res, next) => {
//   const { id } = req.params;
//   const doc = await Content.findById(id).populate("uploader");
//   if (
//     doc.uploader.id === req.user.id ||
//     req.user.username === "libraryadmin1@2022"
//   ) {
//     return next();
//   } else {
//     req.flash("error", "You dont have permission to edit this document");
//     return res.redirect("/");
//   }
// };

module.exports.isTheAdminstrator = async (req, res, next) => {
  if (req.user.username !== "calmconsultadmin") {
    req.flash("error", "You do not have permission to do this");
    return res.redirect("/");
  }
  next();
};
