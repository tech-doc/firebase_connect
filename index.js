const express = require("express");

const app = express();

const PORT = process.env.PORT || 5000;

const admin = require("firebase-admin");

const path = require("path");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

const bodyParser = require("body-parser");

const serviceAccount = require("./config/firebaseKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),

  databaseURL: "https://fir-learning-cf096-default-rtdb.firebaseio.com/",

  authDomain: "fir-learning-cf096.firebaseapp.com",

  storageBucket: "gs://fir-learning-cf096.appspot.com/",
});

// Database

const db = admin.database();

const userRef = db.ref("users");

// Storage

const bucket = admin.storage().bucket();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get("/", (req, res, next) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/adduser", upload.single("imagefile"), (req, res, next) => {
  const body = JSON.stringify(req.body);
  const data = JSON.parse(body);
  const obj = userRef.child(data.id);

  obj.push(data, (err) => {
    if (err) throw err;
    console.log("Succesfull operation...");
  });

  const imageString = req.file.path;
  bucket.upload(imageString, (err) => {
    if (err) throw err;
    console.log("Succesfull file uploaded");
  });
  bucket.upload();

  res.redirect("/");
});

app.use((req, res, next) => {
  res.status(404).write(`<h1>Page not found 404</h1>`);
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
