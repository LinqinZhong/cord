const { BOOKS_DIR, LEARNING_PATH, BOOK_NAME } = require('./config')
const fs = require('fs')
const path = require('path')
const { loadVoice } = require('./voice')
let memos = new Map()

const getPath = (book, chapter) => {
  const cptPath = path.resolve(BOOKS_DIR, book, chapter + '')
  const enPath = path.resolve(cptPath, 'en')
  const cnPath = path.resolve(cptPath, 'cn')
  const pronPath = path.resolve(cptPath, 'pron')
  const stenPath = path.resolve(cptPath, 'sten')
  const stcnPath = path.resolve(cptPath, 'stcn')
  return { cptPath, enPath, cnPath, pronPath, stcnPath, stenPath }
}

const getWord = (current, book, chapter, no) => {
  if (current) {
    console.clear();
    console.log('Loading word, please wait...')
  }
  return new Promise(async (resolve, reject) => {
    try {
      const { enPath, cnPath, pronPath, stcnPath, stenPath } = getPath(book, chapter)
      let en, cn, pron, sten, stcn, barrier
      let memo = memos.get(book + "-" + chapter)
      if (memo) {
        en = memo.en
        cn = memo.cn
        pron = memo.pron
        stcn = memo.stcn
        sten = memo.sten
        barrier = memo.barrier
      } else {
        en = [...String(fs.readFileSync(enPath)).split('\n')]
        cn = [...String(fs.readFileSync(cnPath)).split('\n')]
        pron = [...String(fs.readFileSync(pronPath)).split('\n')]
        sten = [...String(fs.readFileSync(stenPath)).split('\n')]
        stcn = [...String(fs.readFileSync(stcnPath)).split('\n')]
        memo = {}
        memo.chapter = chapter
        memo.en = en
        memo.cn = cn
        memo.pron = pron
        memo.sten = sten
        memo.stcn = stcn
        memos.set(book + "-" + chapter, memo)
      }
      const cpt = path.resolve(LEARNING_PATH, 'books', BOOK_NAME, chapter + '')
      if (!fs.existsSync(cpt)) {
        fs.mkdirSync(cpt, { recursive: true })
      }

      // Preload next word
      if (current) {
        if (no < en.length) {
          getWord(null, book, chapter, no + 1)
        } else {
          getWord(null, book, chapter + 1, 0)
        }
      }

      const enVoice = await loadVoice(en[no])
      const stenVoice = await loadVoice(sten[no])
      resolve({
        no,
        chapter,
        en: en[no],
        cn: cn[no],
        pron: pron[no],
        sten: sten[no],
        stcn: stcn[no],
        barrier: (() => {
          const list = [no]
          const get = () => {
            let i = no
            while (list.includes(i)) i = Math.round(Math.random() * (cn.length - 1))
            return cn[i]
          }
          return [get(), get(), get()]
        })(),
        enVoice,
        stenVoice,
        next() {
          if (current.no < en.length) {
            current.no++
          } else {
            current.no = 0
            current.chapter++
          }
          return resolve(getWord(current, current.book, current.chapter, current.no))
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
      })
    } catch (err) {
      reject(err)
    }
  })
}
module.exports = getWord