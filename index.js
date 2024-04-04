import express from "express";
import pg from 'pg';

const app = express();
const port = 3000;
const pool = new pg.Pool({
  database: "movies",
  host: "localhost",
  user: "postgres",
  password: "admin",
  port: 5432,
  max: 5,
  connectionTimeoutMillis: 20000,
  idleTimeoutMillis: 20000,
  allowExitOnIdle: false
});

// connects to the database
pool.connect();

// currently selected movie id
let currentMovieId = 0;

/**
 * http body decoder
 */
app.use(express.urlencoded({ extended: true }));

/**
 * get currently selected/search movie from database
 */
async function getCurrentMovie() {
  console.log("currentMovieId: ", currentMovieId);
  if (currentMovieId > 0) {
    const result = await pool.query("SELECT * FROM movies WHERE id = $1", [
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
  } else {
    currentMovieId = 0; 
    return null;
  }
}

/**
 * create endpoint. Takes user to create movie screen/ejs
 */
app.get("/new", (req, res) => {
  res.render("new.ejs");
});

/**
 * update endpoint. Takes user to edit movie screen/ejs
 */
app.get("/update", async (req, res) => {
  const currentMovie = await getCurrentMovie()
  console.log("/update: ", currentMovie);
  res.render("new.ejs", { movie: currentMovie });
});

/**
 * /edit endpoint. Edits the current movie record/item in the database 
 */
app.post("/edit", async (req, res) => {
  console.log("/edit req: ", req.body);
  
  const id = req.body.id || currentMovieId; 
  const title = req.body.title;
  const desc = req.body.description;
  const year = req.body.year;
  const duration = req.body.duration;
  const rating = req.body.rating;
  
  try {
    if (title && desc && year && duration && rating && id) {
      const result = await pool.query(
        "UPDATE movies SET title = $1, description = $2, year = $3, duration = $4, rating = $5 WHERE id = $6",
        [title, desc, year, duration, rating, id]
      );
      res.render("index.ejs", { title: title, found: 1 });
      res.status(200);
    } else {
      res.status(404);
    }
  } catch (err) {
    res.status(404);
  }
  
});

/**
 * /create endpoint. Creates new movie record/item in the database and redirects to "/" route
 */
app.post("/create", async (req, res) => {
  console.log("req: ", req.body);
  const title = req.body.title;
  const desc = req.body.description;
  const year = req.body.year;
  const duration = req.body.duration;
  const rating = req.body.rating;

  if (title && desc && year && duration && rating) {
    const result = await pool.query(
      "INSERT INTO movies (title, description, year, duration, rating, liked) VALUES ($1, $2, $3, $4, $5, false)",
      [title, desc, year, duration, rating]
    );
    res.status(201);
  } else {
    res.status(500);
  }
  res.redirect("/");
});

/**
 * /like endpoint. Toggles on/off like boolean flag in database
 */
app.post("/like", async (req, res) => {
  const currentMovie = await getCurrentMovie();
  console.log("/like currentMovie: ", currentMovie);
  try {
    const result = await pool.query(
      "UPDATE movies SET liked = NOT $1 WHERE id = $2 RETURNING *",
      [currentMovie.liked, currentMovie.id]
    );
    console.log("/liked result: ", result.rows[0]);
    const liked = result.rows[0].liked;
    if (liked) {
      res.render("index.ejs", { title: currentMovie.title, found: 1, liked: 1 });
    } else {
      res.render("index.ejs", { title: currentMovie.title, found: 1, liked: 2 });
    }
  } catch (err) {
    res.status(500);
  }
});

/**
 * /like/:id endpoint with id as param. Toggles on/off like boolean flag in database
 */
app.post("/like/:id", async (req, res) => {
  const movieId = req.params.id;
  try {
    const result = await pool.query(
      "UPDATE movies SET liked = true WHERE id = $1 RETURNING *",
      [movieId]
    );
    console.log("/liked result:",result.rows);
    if (result.rows) {
      res.sendStatus(200);
    }
  } catch (err) {
    res.status(500);
  }
});

/**
 * search endpoint. gets movie from the database using title included body in API request.
 * Returns title and 1 for success and 2 for "not found" to be handled in ejs.
 */
app.get("/search", async (req, res) => {
  let title = req.query.title;
  console.log("/search req: ", title);
  try {
    const result = await pool.query(
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

app.delete("/movie/:id", async (req, res) => {
  const movieId = req.params.id;
  try {
    const result = await pool.query(
      "DELETE FROM movies WHERE id = $1",
      [movieId]
    );
    console.log("/delete id: ", movieId);
    res.sendStatus(200);
  } catch (err) {
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
