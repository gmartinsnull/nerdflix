import express from "express";
import pg from "pg";

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
  allowExitOnIdle: false,
});

// connects to the database
pool.connect();

/**
 * http body decoder
 */
app.use(express.urlencoded({ extended: true }));

/**
 * /edit endpoint. Edits the current movie record/item in the database with given data in request body
 */
app.patch("/edit", async (req, res) => {
  console.log("/edit req: ", req.body);

  const id = req.body.id;
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
      res.sendStatus(200);
    } else {
      res
        .status(404)
        .json({ message: "movie not found with given data in request body" });
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

/**
 * /create endpoint. Creates new movie record/item in the database
 */
app.post("/create", async (req, res) => {
  console.log("req: ", req.body);
  const title = req.body.title;
  const desc = req.body.description;
  const year = req.body.year;
  const duration = req.body.duration;
  const rating = req.body.rating;

  if (title && desc && year && duration && rating) {
    try {
      const result = await pool.query(
        "INSERT INTO movies (title, description, year, duration, rating, liked) VALUES ($1, $2, $3, $4, $5, false)",
        [title, desc, year, duration, rating]
      );
      res.sendStatus(201);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  } else {
    res
      .status(500)
      .json({ message: "movie attribute missing in request body" });
  }
});

/**
 * /like/:id endpoint with id as param. Toggles on/off like boolean flag in database
 */
app.post("/like/:id", async (req, res) => {
  const movieId = req.params.id;
  try {
    const result = await pool.query(
      "UPDATE movies SET liked = false WHERE id = $1 RETURNING *",
      [movieId]
    );
    const likedMovie = result.rows[0];
    console.log("/liked result:", likedMovie);
    if (likedMovie) {
      res.sendStatus(200);
    } else {
      res.status(404).json({ message: "movie not found by given id" });
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

/**
 * search endpoint. gets movie from the database using title included body in API request.
 * returns JSON containing movie data retrieved from the database
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
    const data = {
      id: movie.id,
      title: movie.title,
      description: movie.description,
      rating: movie.rating,
      year: movie.year,
      liked: movie.liked,
    };
    console.log("movie data: ", data);
    if (data) {
      res.status(200).json({ movie: data });
    } else {
      res.status(404).json({ message: "movie data not found in the database" });
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

/**
 * delete API responsible for deleting movie item from database based on given movie id in request param
 */
app.delete("/movie/:id", async (req, res) => {
  const movieId = req.params.id;
  try {
    const result = await pool.query("DELETE FROM movies WHERE id = $1", [
      movieId,
    ]);
    console.log("/delete id: ", movieId);
    res.sendStatus(200);
  } catch (err) {
    res.status(404).json({ error: err });
  }
});

/**
 * express/node listening to const port
 */
app.listen(port, () => {
  console.log("server started on port: ", port);
});
