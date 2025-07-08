const User = require("../models/UserSchema");
const Recruiter = require("../models/RecruterSchema");
const passport = require("passport");
const { uploadOnCloudinary } = require("../utils/cloudinary");

// GET: Registration Page
module.exports.renderRegistration = (req, res) => {
	res.render("users/signup.ejs");
};

// POST: Register User with Details
module.exports.registerUserWithDetails = async (req, res, next) => {
  try {
    const {
      username, password, fullName, email, dob, gender, phone, role,
      city, state, country, github, linkedin, portfolio,

      // ResumeExtractedData
      collegeName, degree, startYear, endYear, cgpa,
      skills,

      expCompany, expPosition, expDuration, expDescription,
      expStartDate, expEndDate, expType, expMode, expRole,

      projTitle, projDescription, projTech, projGithub, projLiveSite,

      certTitle, certLink,
      awardTitle, awardDescription, awardLink
    } = req.body;

    if (!username || !password || !fullName || !email) {
      return res.status(400).send("Required fields missing");
    }

    const newUser = new User({
      username,
      fullName,
      email,
      dob,
      gender,
      phone,
      role,
      location: { city, state, country },
      portfolioLinks: { github, linkedin, portfolio },
      resumeExtractedData: {
        collegeDetails: {
          collegeName, degree, startYear, endYear, cgpa
        },
        skills: skills ? skills.split(',').map(skill => skill.trim()) : [],
        experience: expCompany ? [{
          company: expCompany,
          position: expPosition,
          duration: expDuration,
          description: expDescription,
          startDate: expStartDate,
          endDate: expEndDate,
          type: expType,
          mode: expMode,
          role: expRole
        }] : [],
        projects: projTitle ? [{
          title: projTitle,
          description: projDescription,
          technologies: projTech ? projTech.split(',').map(t => t.trim()) : [],
          links: {
            github: projGithub,
            liveSite: projLiveSite
          }
        }] : [],
        certifications: certTitle ? [{
          title: certTitle,
          link: certLink
        }] : [],
        awardsAndHobbies: awardTitle ? [{
          title: awardTitle,
          description: awardDescription,
          link: awardLink
        }] : []
      }
    });

    // ✅ Upload files if provided
    if (req.files) {
      if (req.files.profileImage && req.files.profileImage[0]) {
        const result = await uploadOnCloudinary(req.files.profileImage[0].path);
        if (result) {
          newUser.profileImage = {
            url: result.secure_url,
            filename: result.public_id
          };
        }
      }

      if (req.files.resumeFile && req.files.resumeFile[0]) {
        const result = await uploadOnCloudinary(req.files.resumeFile[0].path);
        if (result) {
          newUser.resumeFile = {
            url: result.secure_url,
            filename: result.public_id
          };
        }
      }
    }

    // ✅ Register user with password
    const registeredUser = await User.register(newUser, password);

    // ✅ Auto-login after registration
    req.login(registeredUser, err => {
      if (err) return next(err);
      res.redirect('/home');
    });

  } catch (err) {
    console.error('❌ Registration error:', err.message);
    res.status(500).send("Something went wrong during registration.");
  }
};


// GET: Login Page
module.exports.renderLogin = (req, res) => {
	res.render("users/login.ejs");
};

// GET: Logout
module.exports.logoutUser = (req, res, next) => {
	req.logout((err) => {
		if (err) return next(err);
		res.redirect("/home");
	});
};

// GET: User Profile Page
module.exports.getProfile = async (req, res) => {
	try {
		const user = req.user;

		if (!user) return res.status(401).send("Unauthorized");

		if (user.role === "recruiter") {
			const recruiterDetails = await Recruiter.findOne({ user: user._id })
				.populate("jobsPosted")
				.populate("Rounds");

			return res.render("users/profile", { user, recruiterDetails });
		} else {
			await user.populate("appliedJobs.jobId");

			return res.render("users/profile", { user });
		}
	} catch (err) {
		console.error("Error fetching profile:", err);
		res.status(500).send("Error fetching profile");
	}
};

// controllers/userController.js

module.exports.getUserProfileById = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Populate appliedJobs with job title and details
    const user = await User.findById(userId).populate("appliedJobs.jobId");

    if (!user) return res.status(404).send("User not found");

    let recruiterDetails = null;

    // If recruiter, fetch their extra info
    if (user.role === "recruiter") {
      recruiterDetails = await Recruiter.findOne({ user: user._id })
        .populate("jobsPosted")
        .populate("Rounds"); // Ensure this path exists in schema
    }

    // Render EJS profile view
    return res.render("users/viewOtherProfile", {
      user,
      recruiterDetails: recruiterDetails || null,
    });

  } catch (err) {
    console.error("❌ Error loading user profile:", err);
    return res.status(500).send("Error fetching user profile");
  }
};
