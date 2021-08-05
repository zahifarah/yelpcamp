const Campground = require("../models/campground");

// INDEX
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({}); // console.log(campgrounds); object inside array
    res.render("campgrounds/index", { campgrounds });
};

// CREATE
module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res) => {
    /* we inherit from multer access to req.files */
    const campground = new Campground(req.body.campground); // returns {"campground: {"title: "Some Title", "location": "Some location"}"}
    campground.images = req.files.map(file => ({ url: file.path, filename: file.filename }));
    campground.author = req.user._id; // assign user._id to campground author key
    const added = await campground.save();
    req.flash("success", "New Campground successfully created!");
    console.log(`ADDED: ${added}`);
    res.redirect(`/campgrounds/${campground._id}`);
};

// SHOW
module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: "reviews", // populate all the reviews from the reviews array, on the one campground we're finding.
        populate: { // then, populate on each one of them their author (so every single review will have its
            path: "author" // author populated.
        }
    })
        .populate("author"); // returns query object
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
};

// EDIT
module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id); // find campground by id
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const updatedCampground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true });
    req.flash("success", "Successfully updated campground!");
    console.log("UPDATED CAMPGROUND!")
    console.log(updatedCampground);
    res.redirect(`/campgrounds/${updatedCampground._id}`);
};

// DELETE
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const deleted = await Campground.findByIdAndDelete(id);
    console.log(`DELETED: ${deleted}`)
    req.flash("success", "Campground deleted!");
    res.redirect("/campgrounds");
};