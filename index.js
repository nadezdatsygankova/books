import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "book_logger",
  password: "Volgograd",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get('/', async (req, res) => {
  try {
    // Check if there's a sort query
    // e.g., /?sort=rating or /?sort=date
    let sortQuery = '';
    if (req.query.sort === 'rating') {
      sortQuery = 'ORDER BY rating DESC';
    } else if (req.query.sort === 'date') {
      sortQuery = 'ORDER BY date_read DESC';
    } else {
      // Default sort: by created date
      sortQuery = 'ORDER BY created_at DESC';
    }

    const { rows: books } = await pool.query(
      `SELECT * FROM books ${sortQuery}`
    );
    res.render('index', { books });
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).send('Internal Server Error');
  }
});
// 2) SHOW FORM TO ADD A NEW BOOK
app.get('/books/new', (req, res) => {
  res.render('create');
});
// 3) CREATE NEW BOOK (handles form submit)
app.post('/books', async (req, res) => {
  try {
    const { title, author, isbn, rating, review, date_read } = req.body;

    // Insert into DB
    await pool.query(
      `INSERT INTO books (title, author, isbn, rating, review, date_read)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [title, author, isbn, rating, review, date_read]
    );

    res.redirect('/');
  } catch (err) {
    console.error('Error adding book:', err);
    res.status(500).send('Internal Server Error');
  }
});
/ 4) SHOW FORM TO EDIT AN EXISTING BOOK
app.get('/books/:id/edit', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM books WHERE id = $1', [id]);

    if (rows.length === 0) {
      return res.status(404).send('Book not found');
    }

    const book = rows[0];
    res.render('edit', { book });
  } catch (err) {
    console.error('Error fetching book:', err);
    res.status(500).send('Internal Server Error');
  }
});

// 5) UPDATE BOOK (handles edit form submit)
app.post('/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, isbn, rating, review, date_read } = req.body;

    // Update book
    await pool.query(
      `UPDATE books
       SET title = $1,
           author = $2,
           isbn = $3,
           rating = $4,
           review = $5,
           date_read = $6,
           updated_at = NOW()
       WHERE id = $7`,
      [title, author, isbn, rating, review, date_read, id]
    );

    res.redirect('/');
  } catch (err) {
    console.error('Error updating book:', err);
    res.status(500).send('Internal Server Error');
  }
});

// 6) DELETE A BOOK
app.post('/books/:id/delete', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM books WHERE id = $1', [id]);
    res.redirect('/');
  } catch (err) {
    console.error('Error deleting book:', err);
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