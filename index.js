const handleLearn = require("./lib/learn");
const rl = require("./lib/readline");

handleLearn().then(() => { }).catch((err) => {
  console.log('err', err);
}).finally(() => {
  rl.close()
})