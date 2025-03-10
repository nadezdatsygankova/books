import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
const app = express();
const PORT = 3000;
import { dirname } from "path";
import { fileURLToPath } from "url";
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import ejs from 'ejs';
import path from 'path';
// Use __dirname when setting up views or static files
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

const db = new pg.Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// -------------- HOME (LIST BOOKS) --------------
app.get('/', async (req, res) => {
  try {
    // Fetch books from DB
    const sort = req.query.sort;
    let sortQuery = '';
    if (sort === 'rating') sortQuery = 'ORDER BY rating DESC';
    else if (sort === 'date') sortQuery = 'ORDER BY date_read DESC';
    else sortQuery = 'ORDER BY created_at DESC';

    const { rows: books } = await db.query(`SELECT * FROM books ${sortQuery}`);

    // 1) Render the partial for index content
    ejs.renderFile(
      path.join(__dirname, 'views', 'index.ejs'),
      { books },
      (err, str) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error rendering index content');
        }
        // 2) Now render the layout, passing in the string
        res.render('layout', { body: str });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// -------------- CREATE BOOK PAGE --------------
app.get('/books/new', (req, res) => {
  // 1) Render the createContent.ejs partial
  ejs.renderFile(
    path.join(__dirname, 'views', 'create.ejs'),
    {}, // no data needed
    (err, str) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error rendering create content');
      }
      // 2) Render layout with the partial’s HTML
      res.render('layout', { body: str });
    }
  );
});

// -------------- CREATE BOOK HANDLER --------------
app.post('/books', async (req, res) => {
  try {
    const { title, author, isbn, rating, review, date_read } = req.body;
    await db.query(
      `INSERT INTO books (title, author, isbn, rating, review, date_read)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [title, author, isbn, rating, review, date_read]
    );
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// -------------- EDIT BOOK PAGE --------------
app.get('/books/:id/edit', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM books WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).send('Book not found');
    }
    const book = rows[0];

    // 1) Render the editContent.ejs partial with the book
    ejs.renderFile(
      path.join(__dirname, 'views', 'edit.ejs'),
      { book },
      (err, str) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error rendering edit content');
        }
        // 2) Wrap it in layout
        res.render('layout', { body: str });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// -------------- EDIT BOOK HANDLER --------------
app.post('/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, isbn, rating, review, date_read } = req.body;
    await db.query(
      `UPDATE books SET
         title = $1,
         author = $2,
         isbn = $3,
         rating = $4,
         review = $5,
         date_read = $6
       WHERE id = $7`,
      [title, author, isbn, rating, review, date_read, id]
    );
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// -------------- DELETE BOOK --------------
app.post('/books/:id/delete', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM books WHERE id = $1', [id]);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


// 7) OPTIONAL: API INTEGRATION ROUTE (Example)
app.get('/cover/:isbn', async (req, res) => {
  const { isbn } = req.params;

  try {
    // For the Covers API, we actually just need the URL.
    // But let's show an example of using Axios to confirm it’s valid:
    const coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

    // We can do a HEAD request to see if the cover exists
    // (Open Library typically returns 200 OK even if the ISBN isn't found,
    //  so this is partly for demonstration.)
    const response = await axios.head(coverUrl);

    // If success, return the cover URL or an object
    res.json({ coverUrl });
  } catch (err) {
    console.error('Error calling Open Library API:', err);
    res.status(500).json({ error: 'Failed to fetch cover image' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});