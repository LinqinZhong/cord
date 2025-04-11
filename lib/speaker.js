const player = require('node-wav-player');
let isPlaying = false
const speak = (src) => {
 if(isPlaying)  player.stop()
  isPlaying = true
  return player.play({
    path: src,
    sync: true
  })
}
module.exports = {
  speak
}