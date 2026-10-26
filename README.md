# Blog Platform LIS 5613 Final Project

---

## Setup Instructions

### Install Dependencies

Navigate to the project folder in the terminal and run:

npm install express mysql

### Create the Database

Open MySQL, login, and run:

CREATE DATABASE blog_platform;

USE blog_platform;

CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

You may have to manually start MySQL80 through Windows Services Manager (or Mac equivalent)

### Update Database Connection

In `app.js`, update the MySQL connection information if needed:

js
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Password123!',
  database: 'blog_platform'
});

### Run the Application

Open a new command window, make sure you're in the project directory, and start the server:

node app.js

There will be a message confirming that the server is running.

Open the browser and go to:

http://localhost:3000

---

## Database Export

The database can be exported using:

mysqldump -u root -p blog_platform > data-dump.sql

---

## Project Files

* `app.js` - Express server and backend routes
* `index.html` - Frontend structure
* `style.css` - Application styling
* `script.js` - Frontend JavaScript functionality
* `data-dump.sql` - Exported MySQL database