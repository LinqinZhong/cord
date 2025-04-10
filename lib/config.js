const path = require('path');
const BOOK_NAME = 'default'
const BOOKS_DIR = path.resolve(__dirname, '../books');
const LEARNING_PATH = path.resolve(__dirname, '../learning');
const CURRENT_PATH = path.resolve(LEARNING_PATH, 'current');

module.exports = {
  BOOK_NAME, BOOKS_DIR, LEARNING_PATH, CURRENT_PATH
}