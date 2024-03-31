import express from "express";
import pg from "pg";

const app = express();
const port = 3000;
const db = new pg.Client({
  database: "movies",
  host: "localhost",
  user: "postgres",
  password: "admin",
  port: 5432,
});

db.connect();

// hashmap of movies. Will be replaced with db eventually
let movies = {
  "the lord of the rings": false,
  "the avengers": false,
  "iron man": false,
  godzilla: false,
  dune: false,
};
let currentMovieId = 0;

/**
 * http body decoder
 */
app.use(express.urlencoded({ extended: true }));

async function getCurrentMovie() {
  const result = await db.query("SELECT * FROM movies WHERE id = $1", [
    currentMovieId,
  ]);
  const movie = result.rows[0];
  const currentMovie = {
    id: movie.id,
    title: movie.title,
    description: movie.description,
    year: movie.year,
    duration: movie.duration,
    rating: movie.rating,
    liked: movie.liked,
  };
  return currentMovie;
}

/**
 * create endpoint. Takes user to create movie screen/ejs
 */
app.get("/create", (req, res) => {
  res.render("new.ejs");
});

/**
 * create endpoint. Takes user to create movie screen/ejs
 */
app.post("/add", async (req, res) => {
  console.log("req: ", req.body);
  const title = req.body.title;
  const desc = req.body.description;
  const year = req.body.year;
  const duration = req.body.duration;
  const rating = req.body.rating;

  if (title && desc && year && duration && rating) {
    const result = await db.query(
      "INSERT INTO movies (title, description, year, duration, rating, liked) VALUES ($1, $2, $3, $4, $5, false)",
      [title, desc, year, duration, rating]
    );
    res.status(201);
  } else {
    res.status(400);
  }
  res.redirect("/");
});

/**
 * like endpoint. Toggles on/off like flag in data set
 */
app.post("/like", async (req, res) => {
  const currentMovie = await getCurrentMovie();
  console.log("current: ", currentMovie);
  try {
    const result = await db.query(
      "UPDATE movies SET liked = NOT $1 WHERE id = $2 RETURNING *",
      [currentMovie.liked, currentMovie.id]
    );
    console.log("movie liked: ", result.rows[0]);
    const liked = result.rows[0].liked;
    if (liked) {
      res.render("index.ejs", { title: currentMovie.title, liked: 1 });
    } else {
      res.render("index.ejs", { title: currentMovie.title, liked: 2 });
    }
  } catch (err) {
    res.status(500);
  }
});

/**
 * search endpoint. returns 1 for success and 2 for "not found"
 */
app.get("/search", async (req, res) => {
  let title = req.query.title;
  console.log("title: ", title);
  try {
    const result = await db.query(
      "SELECT * FROM movies WHERE LOWER(title) LIKE '%' || $1 || '%';",
      [title.toLowerCase().trim()]
    );
    const movie = result.rows[0];
    console.log("movie: ", movie);
    if (movie) {
      currentMovieId = movie.id;
      res.render("index.ejs", { title: movie.title, found: 1 });
    } else {
      res.render("index.ejs", { title: movie.title, found: 2 });
    }
  } catch (err) {
    res.render("index.ejs", { title: title, found: 2 });
    res.status(404);
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
