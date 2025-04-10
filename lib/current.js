const fs = require('fs');
const { CURRENT_PATH,BOOK_NAME } = require('./config')

const getCurrent = () => {
  if (!fs.existsSync(CURRENT_PATH)) {
    fs.writeFileSync(CURRENT_PATH, JSON.stringify({ book: BOOK_NAME, chapter: 1, no: 0 }))
  }
  const current = JSON.parse(fs.readFileSync(CURRENT_PATH))
  current.save = (wordList) => {
    fs.writeFileSync(CURRENT_PATH, JSON.stringify({
      book: current.book,
      chapter: current.chapter,
      no: current.no
    }))
  }
  return current
}

module.exports = getCurrent