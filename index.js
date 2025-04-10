const readline = require('readline');
const getCurrent = require('./lib/current');
const getWord = require('./lib/word');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const CURRENT = getCurrent()

const learn1 = (num = 0, word = getWord(CURRENT), wordList = []) => {
  return new Promise((resolve) => {
    if (num === 5) {
      resolve(wordList)
      return
    }
    console.clear()
    console.log('Type this word with your keyboard.');
    console.log('--------------------------------------');
    console.log('|   ' + word.cn + '\t', word.en);
    console.log('--------------------------------------');

    rl.question(':', (answer) => {
      if (answer === '') {
        rl.question('Add to known list? /(type y continue):', (answer) => {
          if (answer === 'y') {
            word.isKnown = true
            wordList.push(word)
            word = word.next()
          }
          learn1(num, word, wordList)
        })
        return
      } else if (answer === word.en) {
        wordList.push(word)
        word = word.next()
      }
      resolve(learn1(num + 1, word, wordList))
    })
  })
}

const learn2 = (wordList, index = 0, showLength = true) => {
  return new Promise((resolve) => {
    if (index >= wordList.length) {
      resolve(wordList)
      return
    }
    const word = wordList[index]
    if (!word.tryTimes) word.tryTimes = 0
    if (!word.wrongTimes) word.wrongTimes = 0
    if (word.isKnown === true) {
      resolve(learn2(wordList, index + 1, showLength))
    }
    const input = (wrong = false) => {
      console.clear()
      const retryTimes = word.wrongTimes > word.tryTimes ? `[${word.tryTimes}/${word.wrongTimes}] ` : ''
      const progress = `${retryTimes}(${index + 1}/${wordList.length})`
      if (wrong) console.log('\x1b[31mWrong answer! Try again! \x1b[0m' + progress);
      else console.log('Spell this word.' + progress);
      console.log('--------------------------------------');
      console.log('|  ' + (showLength ? word.en.replace(/./g, '*') : "?") + ' ' + word.cn);
      console.log('--------------------------------------');
      rl.question(':', (answer) => {
        if (answer === word.en) {
          if (!word.tryTimes) word.tryTimes = 0
          if (word.wrongTimes > word.tryTimes) {
            word.tryTimes++
            resolve(learn2(wordList, index, showLength))
            return
          }
          resolve(learn2(wordList, index + 1, showLength))
        } else {
          word.wrong()
          if (word.wrongTimes % 4 === 3) {
            console.clear()
            if (word.wrongTimes > 10) {
              console.log('\x1b[31mOh my God, is this word too difficult to remember?\x1b[0m');
            }
            console.log(`You have wrong \x1b[31m${word.wrongTimes}\x1b[0m times, here is the answer.`);
            console.log('--------------------------------------');
            console.log('| \x1b[32m' + word.en + '\x1b[0m  ' + word.cn);
            console.log('--------------------------------------');
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


const startToLearn = () => {
  return new Promise(async (resolve) => {
    const wordList = await learn2(await learn2(await learn1()), 0, false)
    wordList.forEach((w) => {
      w.save()
    })
    CURRENT.save()
    console.clear()
    console.log('\x1b[32mGreat! You have learn ${} words today, do you want to try more.\x1b[0m');
    rl.question('Continue to learn 5 words? /(type y continue):', (answer) => {
      if (answer === 'y') {
        resolve(startToLearn())
      }else{
        resolve()
      }
    })
  })
}

startToLearn().then(() => {
  rl.close()
})