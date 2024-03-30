import express from "express";

const app = express();
const port = 3000;

// hashmap of movies. Will be replaced with db eventually
// todo: replace with database solution
const movies = {
  "the lord of the rings": false,
  "the avengers": false,
  "iron man": false,
  "godzilla": false,
  "dune": false
};

/**
 * http body decoder
 */
app.use(express.urlencoded({ extended: true }));

/**
 * like endpoint. Toggles on/off like flag in data set
 */
app.post("/create", (req, res) => {
    let title = req.body.title;
    console.log(title);
    if (!(title.toLowerCase() in movies)) {
        movies[title.toLowerCase()] = false;
        res.render("index.ejs", { title: title, added: 1 }); 
    } else {
        res.render("index.ejs", { title: title, added: 2 }); 
    }
    console.log("movies",movies);
});
  
app.use(express.urlencoded({ extended: true }));

/**
 * like endpoint. Toggles on/off like flag in data set
 */
app.post("/like", (req, res) => {
    let title = req.body.title;
    console.log(title);
    if (title.toLowerCase() in movies) {
        let toggle = !movies[title.toLowerCase()];
        movies[title.toLowerCase()] = toggle;
        if (toggle) {
            res.render("index.ejs", { title: title, liked: 1 }); 
        }else {
            res.render("index.ejs", { title: title, liked: 2 }); 
        }
        
    } 
    console.log("movies",movies);
  });

/**
 * search endpoint. returns 1 for success and 2 for "not found"
 */
app.get("/search", (req, res) => {
  let title = req.query.title;
  console.log(title);
  if (title.toLowerCase() in movies) {
    res.render("index.ejs", { title: title, found: 1 }); 
  } else {
    res.render("index.ejs", { title: title, found: 2 }); 
  }
});

/**
 * home default endpoint. Simply returns index EJS
 */
app.get("/", (req, res) => {
  res.render("index.ejs");
});

/**
 * express/node listening to const port
 */
app.listen(port, () => {
  console.log("server started on port: ", port);
});
