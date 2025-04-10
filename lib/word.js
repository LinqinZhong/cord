const { BOOKS_DIR, LEARNING_PATH, BOOK_NAME } = require('./config')
const fs = require('fs')
const path = require('path')
let memos = new Map()
const getWord = (current) => {
  const cptPath = path.resolve(BOOKS_DIR, current.book, current.chapter + '')
  const enPath = path.resolve(cptPath, 'en')
  const cnPath = path.resolve(cptPath, 'cn')
  let en, cn
  let memo = memos.get(current.book + "-" + current.chapter)
  if (memo) {
    en = memo.en
    cn = memo.cn
  } else {
    en = [...String(fs.readFileSync(enPath)).split('\n')]
    cn = [...String(fs.readFileSync(cnPath)).split('\n')]
    memo = {}
    memo.chapter = current.chapter
    memo.en = en
    memo.cn = cn
    memos.set(current.book + "-" + current.chapter, memo)
  }
  const cpt = path.resolve(LEARNING_PATH, 'books', BOOK_NAME, current.chapter + '')
  if (!fs.existsSync(cpt)) {
    fs.mkdirSync(cpt, { recursive: true })
  }
  return {
    no: current.no,
    chapter: current.chapter,
    en: en[current.no],
    cn: cn[current.no],
    next() {
      if (current.no < en.length) {
        current.no++
      } else {
        current.no = 0
        current.chapter++
      }
      return getWord(current)
    },
    save() {
      const knownPath = path.resolve(cpt, 'known')
      const knownList = fs.existsSync(knownPath) ? String(fs.readFileSync(knownPath)).split('\n') : []
      knownList[this.no] = Date.now()
      fs.writeFileSync(knownPath, knownList.join('\n'))
    },
    wrong() {
      if (!this.wrongTimes) this.wrongTimes = 0
      this.wrongTimes++
      const wrongLogPath = path.resolve(cpt, 'wrong')
      const wrongList = fs.existsSync(wrongLogPath) ? String(fs.readFileSync(wrongLogPath)).split('\n') : []
      wrongList[this.no] = (Number(wrongList[this.no]) || 0) + 1
      fs.writeFileSync(wrongLogPath, wrongList.join('\n'))
    }
  }
}
module.exports = getWord