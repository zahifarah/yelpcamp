const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary"); // no need to specify index.js as Node checks for it automatically.
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken }); // new instance of mapbox containing:
// (1) forwardGeocode (the one we need) and reverseGeocode + (2) our access token

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
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1,
    }).send();
    const campground = new Campground(req.body.campground); // returns {"campground: {"title: "Some Title", "location": "Some location"}"}
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(file => ({ url: file.path, filename: file.filename })); /* from multer we get access to req.files */
    campground.author = req.user._id; // assign user._id to campground author key
    await campground.save();
    console.log(campground);
    req.flash("success", "New Campground successfully created!");
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

// UPDATE
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
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) { // if there are images to delete
        for (let filename of req.body.deleteImages) { // if yes, loop over each one
            await cloudinary.uploader.destroy(filename); // should delete that particular file
        };
        // updating campground that we've already found, a second time (so we don't need to find it again).
        // pull from the images array, ALL images, where the filename of that image is in the req.body.deleteImages array.
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    };
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
};



// DELETE
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const deleted = await Campground.findByIdAndDelete(id);
    console.log(`DELETED: ${deleted}`)
    req.flash("success", "Campground deleted!");
    res.redirect("/campgrounds");
};