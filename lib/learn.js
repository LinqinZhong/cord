const getWord = require('./word');
const getCurrent = require('./current');
const rl = require('./readline');
const { speak } = require('./speaker');
const CURRENT = getCurrent()
const TOTAL = 5
const learn1 = (num = 0, word, wordList = []) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!word) {
        word = await getWord(CURRENT, CURRENT.book, CURRENT.chapter, CURRENT.no)
      }
      if (num === TOTAL) {
        resolve(wordList)
        return
      }
      const stenVoice = word.stenVoice
      speak(word.enVoice).then(() => {
        setTimeout(() => {
          speak(stenVoice)
        }, 10);
      })

      const progress = `(${num + 1}/${TOTAL})`
      console.clear()
      console.log('Type this word with your keyboard.' + progress);
      console.log('----------------------------------------------');
      console.log('|   ' + word.cn + ' ', word.en + ' ' + word.pron);
      console.log('|   ');
      console.log('|   ' + word.sten);
      console.log('|   ' + word.stcn);
      console.log('----------------------------------------------');

      rl.question(':', async (answer) => {
        if (answer === '') {
          rl.question('Add to known list? /(type y continue):', (answer) => {
            if (answer === 'y') {
              word.isKnown = true
              wordList.push(word)
              word = word.next()
            }
            resolve(learn1(num, word, wordList))
          })
          return
        } else if (answer === word.en) {
          wordList.push(word)
          word = await word.next()
          resolve(learn1(num + 1, word, wordList))
          return
        }
        resolve(learn1(num, word, wordList))
      })
    } catch (err) {
      reject(err)
    }
  })
}

const learn2 = (wordList, index = 0, showLength = true) => {
  return new Promise((resolve) => {
    if (index >= wordList.length) {
      resolve(wordList.slice(0, TOTAL))
      return
    }
    const word = wordList[index]
    if (!word.tryTimes) word.tryTimes = 0
    if (!word.wrongTimes) word.wrongTimes = 0
    if (word.isKnown === true) {
      resolve(learn2(wordList, index + 1, showLength))
      return
    }
    const input = (wrong = false) => {
      console.clear()
      const progress = `(${index + 1}/${wordList.length})`
      if (wrong) console.log('\x1b[31mWrong answer! Try again! \x1b[0m' + progress);
      else console.log('Spell this word.' + progress);

      console.log('----------------------------------------------');
      console.log('|  ' + (showLength ? word.en.replace(/./g, '*') : "?") + ' ' + word.cn);
      console.log('----------------------------------------------');
      rl.question(':', (answer) => {
        if (answer === word.en) {
          speak(word.enVoice).then(() => {
            resolve(learn2(wordList, index + 1, showLength))
          })
        } else {
          wordList.push(word)
          word.wrong()
          if (word.wrongTimes % 4 === 3) {
            console.clear()
            if (word.wrongTimes > 10) {
              console.log('\x1b[31mOh my God, is this word too difficult to remember?\x1b[0m');
            }
            console.log(`You have wrong \x1b[31m${word.wrongTimes}\x1b[0m times, here is the answer.`);
            console.log('----------------------------------------------');
            console.log('| \x1b[32m' + word.en + '\x1b[0m  ' + word.cn);
            console.log('----------------------------------------------');
            rl.question('Press any key to continue.', () => {
              input(false, 0)
            })
          } else {
            input(true, 0)
          }
        }
      })
    }
    input()
  })
}

const learn3 = (wordList, index = 0) => {
  return new Promise((resolve) => {
    if (wordList.length === index) {
      resolve(wordList.slice(0,TOTAL))
      return
    }
    const word = wordList[index]
    speak(word.stenVoice)
    console.clear()
    console.log('Translate this sentence.');
    console.log('----------------------------------------------');
    console.log('|  \x1b[32m' + word.sten + '\x1b[0m');
    console.log('----------------------------------------------');
    rl.question(':', (answer) => {
      console.clear()
      console.log('----------------------------------------------');
      console.log(`|  Sentence: \x1b[32m${word.sten}\x1b[0m`);
      console.log(`|  English: \x1b[32m${word.en}\x1b[0m`);
      console.log(`|  Chinese: \x1b[32m${word.cn}\x1b[0m`);
      console.log(`|  Pronunciation: \x1b[32m${word.pron}\x1b[0m`);
      console.log(`|  Your answer: \x1b[32m${answer}\x1b[0m`);
      console.log(`|  Reference answer: \x1b[32m${word.stcn}\x1b[0m`);
      console.log('----------------------------------------------');
      rl.question('Enter to continue.', () => {
        resolve(learn3(wordList, index + 1))
      })
    })
  })
}

const learn4 = (wordList, index = 0, wrong = false) => {
  return new Promise((resolve, reject) => {
    if (wordList.length === index) {
      resolve(wordList.slice(0, TOTAL))
      return
    }
    try {
      const word = wordList[index]
      console.clear()
      if (wrong) console.log('\x1b[38m' + 'The answer you have pick is incorrect, try again!' + '\x1b[0m');
      console.log('What does the word you have listened to mean？');
      console.log('----------------------------------------------');
      const options = [word.cn, ...word.barrier]
      options.sort(() => {
        return 0.5 - Math.random()
      })
      options.forEach((option, index) => {
        console.log('|  \x1b[32m' + `${index + 1}.${option}` + '\x1b[0m');
      })
      console.log('----------------------------------------------');
      speak(word.enVoice)
      rl.question(":", (answer) => {
        const i = Number(answer)
        if (i) {
          const cn = options[i - 1]
          if (cn === word.cn) {
            resolve(learn4(wordList, index + 1))
            return
          }
        }
        word.wrong()
        resolve(learn4(wordList, index, true))
      })
    } catch (err) {
      reject(err)
    }
  })
}

const learn5 = (wordList, index = 0) => {
  return new Promise((resolve, reject) => {
    if (wordList.length === index) {
      resolve(wordList.slice(0,TOTAL))
      return
    }
    try {
      const word = wordList[index]
      console.clear()
      console.log('Input the sentence you have listened.');
      speak(word.stenVoice)
      rl.question(":", (answer) => {
        if (answer.toLocaleLowerCase().replace(/\./, '') === word.sten.toLocaleLowerCase().replace(/\./, '')) {
          resolve(learn5(wordList, index + 1))
          return
        }
        word.wrong()
        console.log('----------------------------------------------');
        console.log(`|  Your answer: \x1b[32m${answer}\x1b[0m`);
        console.log(`|  Reference answer: \x1b[32m${word.sten}\x1b[0m`);
        console.log('----------------------------------------------');
        wordList.push(word)
        rl.question('Enter to retry.', () => {
          resolve(learn5(wordList, index + 1))
        })
      })
    } catch (err) {
      reject(err)
    }
  })
}

const handleLearn = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const wordList = await learn5(await learn3(await learn4(await learn2(await learn2(await learn1()), 0, false))))
      wordList.forEach((w) => {
        w.save()
      })
      CURRENT.save()
      console.clear()
      console.log('\x1b[32mGreat! You have learn ${} words today, do you want to try more.\x1b[0m');
      rl.question('Continue to learn 5 words? /(type y continue):', (answer) => {
        if (answer === 'y') {
          resolve(handleLearn())
        } else {
          resolve()
        }
      })
    } catch (err) {
      reject(err)
    }
  })
}


module.exports = handleLearn
