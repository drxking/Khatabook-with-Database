const express = require("express")
const app = express()
const log = require("debug")("development:app")
const path = require('path')
const expressSession = require('express-session')
const flash = require("connect-flash")
const cookieParser = require("cookie-parser");
const mongooseconnection = require("./config/mongoose")
const userModel = require("./models/userModel")
const hisaabModel = require("./models/hisaabModel")



app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set("view engine", "ejs")

app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: "qwertyuiop"
}))
app.use(flash())
app.use(cookieParser())


let isLoggedIn = (req,res,next)=>{
    if(req.cookies.user){
        next()
        console.log("User is logged in")
    }
    else{
        req.flash("message","You are not LoggedIn, Please Login First")
        res.redirect('/login')
    }
}


app.get('/', (req, res) => {
    res.render("index")
})


app.get("/login", async (req, res) => {
    try {
        if (req.cookies.user) return res.redirect(`/dashboard/${req.cookies.user}`)
        let message = req.flash("message")
        res.render("login", { message })
    }
    catch (err) {
        res.status(500).send(err.message)
    }
})




app.get("/signup", (req, res) => {
    try {
        let exist = req.flash("exist")
        res.render("signup", { exist })
    }
    catch (err) {
        return res.status(500).send(err.message)
    }
})



app.post("/register", async (req, res) => {
    try {
        let user = await userModel.findOne({ email: { $eq: req.body.email } })
        if (user) {
            req.flash("exist", "User Already Exists! Please Login")
            res.redirect("/signup")
        }
        else {
            await userModel.create({
                email: req.body.email,
                password: req.body.password
            })
            req.flash("message", "User Created")
            res.redirect("/login")
        }
    }
    catch (err) {
        return res.status(500).send(err.message)
    }

})



app.post("/login", async (req, res) => {
    try {
        let { email, password } = req.body;
        let user = await userModel.findOne({ email });
        if (!user) {
            req.flash("message", "This Account Does not Exist")
            res.redirect("/login")
        }
        else {
            if (email === user.email && password === user.password) {
                res.cookie("user", user._id)
                res.redirect(`dashboard/${user._id}`)

            }
            else {
                req.flash("message", "Email and Password doesnot matched")
                res.redirect("/login")
            }
        }
    }
    catch (err) {
        res.status(500).send(err.message)
    }
})




app.get("/dashboard/:id", isLoggedIn, async (req, res) => {
    try {
        let user = await userModel.findOne({ _id: req.params.id })
        let hisaab = await hisaabModel.find({ createrId: { $eq: req.params.id } })
        res.render("dashboard", {
            user, hisaab
        })
    }
    catch (err) {
        res.status(500).send(err.message)
    }
})





app.get("/createhisaab/:user",isLoggedIn, (req, res) => {
    try {
        let user = req.params.user;
        res.render("create", { user })
    }
    catch (err) {
        res.status(500).send(err.message)
    }
});



app.post("/create/:userid",isLoggedIn, async (req, res) => {
    try {
        let { title, description, sharable, encrypted, password } = req.body;
        (encrypted === "on") ? encrypted = true : encrypted = false;
        (sharable === "on") ? sharable = true : sharable = false;

        let hisaab = await hisaabModel.create({
            createrId: req.params.userid,
            title,
            description,
            sharable,
            encrypted,
            password
        })
        let user = await userModel.findOne({ _id: { $eq: req.params.userid } })
        let userhisaab = user.hisaab
        userhisaab.push(hisaab._id)
        await userModel.findOneAndUpdate({ _id: { $eq: user._id } }, { hisaab: userhisaab });
        res.redirect(`/dashboard/${req.params.userid}`)
    }
    catch (err) {
        res.status(500).send(err.message)
    }
})




app.get("/check/:hisaab", isLoggedIn, async (req, res) => {
    try {
        let url = req.params.hisaab
        url = url.replace("brUtAlItY", "");
        let message = req.flash("hisaab_pass")
        let hisaab = await hisaabModel.findOne({ _id: { $eq: url } })
        let user = await userModel.findOne({ _id: { $eq: req.cookies.user } })
        if (hisaab.encrypted) {
            res.render("encrypted", { hisaab, user, message })
        }
        else {
            res.redirect(`/view/${url}`)
        }
    }
    catch (err) {
        res.status(500).send(err.message)
    }
})

app.post("/encryptcheck/:hisaab",isLoggedIn, async (req, res) => {
    try {
        let hisaab = await hisaabModel.findOne({ _id: { $eq: req.params.hisaab } })
        if (req.body.password === hisaab.password) {
            res.redirect(`/view/${req.params.hisaab}`)
        }
        else {
            req.flash("hisaab_pass", "Incorrect Password")
            res.redirect(`/check/${req.params.hisaab}`)
        }
    }
    catch (err) {
        res.status(500).send(err.message)
    }
})



app.get("/view/:hisaab",isLoggedIn, async (req, res) => {
    try {
        if (req.cookies.user) {
            let user = await userModel.findOne({ _id: { $eq: req.cookies.user } })
            let hisaab = await hisaabModel.findOne({ _id: { $eq: req.params.hisaab } })
            let creater = await userModel.findOne({ _id: { $eq: hisaab.createrId } })
            res.render("view", { hisaab, user, creater })
        }
        else {
            req.flash('message', 'Please login First and Paste link')
            res.redirect("/login")
        }
    }
    catch (err) {
        res.status(500).send(err.message)
    }
})

app.get("/edit/:hisaab",isLoggedIn, async (req, res) => {
    try {
        let user = await userModel.findOne({ _id: { $eq: req.cookies.user } })
        let hisaab = await hisaabModel.findOne({ _id: { $eq: req.params.hisaab } })
        res.render("edit", { user, hisaab })
    }
    catch (err) {
        res.status(500).send(err.message)
    }
})

app.post("/update/:hisaab",isLoggedIn, async (req, res) => {
    try {
        let { title, description, sharable, encrypted, password } = req.body;
        (encrypted === "on") ? encrypted = true : encrypted = false;
        (sharable === "on") ? sharable = true : sharable = false;
        let hisaabdata = await hisaabModel.findOneAndUpdate({ _id: { $eq: req.params.hisaab } }, {
            title,
            description,
            sharable,
            encrypted,
            password
        }, { new: true })

        res.redirect(`/view/${hisaabdata._id}`)
    }
    catch (err) {
        res.status(500).send(err.message)
    }
})


app.get("/delete/:hisaab",isLoggedIn, async (req, res) => {
    try {
        await hisaabModel.findOneAndDelete({ _id: { $eq: req.params.hisaab } })
        let user = await userModel.findOne({ _id: req.cookies.user });
        let hisaabs = user.hisaab;
        hisaabs.pop(req.params.hisaab)
        await userModel.findOneAndUpdate({ _id: req.cookies.user }, { hisaab: hisaabs });
        res.redirect(`/dashboard/${req.cookies.user}`)
    }
    catch (err) {
        res.status(500).send(err.message)
    }
})
app.get("/logout", (req, res) => {
    try {
        res.cookie("user", "")
        res.redirect("/")
    }
    catch (err) {
        res.status(500).send(err.message)
    }
})

app.listen(3000, () => {
    log("Listening at port 3000")
})