Books CRUD Project

A simple Node.js application for managing your reading list with Create, Read, Update, and Delete (CRUD) operations. Uses PostgreSQL for data storage, EJS for server-side rendering, and Bootstrap for styling. Integrates with the Open Library Covers API to display book covers by ISBN.

Features
	•	CRUD: Add new books, view a list of books, update existing books, and delete entries.
	•	PostgreSQL: Stores all book data (title, author, ISBN, rating, review, etc.).
	•	Open Library Covers: Fetches covers by ISBN using the API.
	•	Sorting: Sort your book list by rating, date read, or default creation date.
	•	Bootstrap: Provides a modern, responsive design.
	•	Environment Variables: Manage DB credentials securely via .env.

  Table of Contents
	1.	Requirements
	2.	Installation
	3.	Configuration
	4.	Database Setup
	5.	Usage
	6.	Project Structure
	7.	Routes Overview
	8.	License

Requirements
	•	Node.js (v14+ recommended)
	•	PostgreSQL (v12+ recommended)

Installation
	1.	Clone the repository:
```
git clone https://github.com/yourusername/books-project.git
cd books-project
```
2. 	Install dependencies:
```
npm install
```
3.	3.	Set up environment variables:
See Configuration below.

4.	Run the server:
