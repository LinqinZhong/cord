const player = require('node-wav-player');
const speak = (src) => {
  return player.play({
    path: src,
  })
}
module.exports = {
  speak
}