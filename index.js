const handleLearn = require("./lib/learn");
const rl = require("./lib/readline");

handleLearn().then(() => {
  rl.close()
})