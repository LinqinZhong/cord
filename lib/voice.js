const crypto = require('crypto');
const http = require('http');
const querystring = require('querystring')
const fs = require('fs');
const path = require('path');
const { LEARNING_PATH } = require('./config');

const loadVoice = (text) => {
  return new Promise((resolve, reject) => {
    const voicePath = path.resolve(LEARNING_PATH, 'voice')
    if (!fs.existsSync(voicePath)) {
      fs.mkdirSync(voicePath, { recursive: true })
    }
    const hash = crypto.createHash('md5').update(text).digest('hex')
    const filePath = path.resolve(voicePath, hash + '.wav')
    if (fs.existsSync(filePath)) {
      resolve(filePath)
      return
    }
    const file = fs.createWriteStream(filePath)
    const salt = crypto.randomUUID()
    const appKey = '2005336e231864fa'
    const secretKey = 'boU5qMMjOCA8ou4a2iTbITZSOT2S3tR2'
    const curtime = Math.round(new Date().getTime() / 1000)
    const input = text.length > 20 ? text.substring(0, 10) + (text.length) + text.substring(text.length - 10) : text    
    const sign = crypto.createHash('sha256').update(appKey + input + salt + curtime + secretKey).digest('hex')
    const data = querystring.stringify({
      q: text,
      appKey,
      salt,
      sign,
      curtime,
      signType: 'v3',
      format: 'wav',
      curtime,
      voiceName: 'Noah'
    })
    const req = http.request({
      host: 'openapi.youdao.com',
      data: data,
      path: '/ttsapi',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': data.length
      },

    }, (res) => {
      let err
      res.on('data', (data) => {
        err = data
        if(!file.destroyed) file.write(data)
      })
      res.on('end', () => {
        if(res.headers['content-type'] === 'audio/pcm'){
          resolve(filePath)
          file.close()
        }else{
          reject(new Error(text + '-----'+ String(err)))
          file.close()
          fs.unlinkSync(filePath)
        }
        req.destroy()
      })
    })
    req.write(data)
  })
}

module.exports = {
  loadVoice
}