const express = require('express')
const app = express()

const PORT = process.env.PORT || 3030
const server = app.listen(PORT, () => console.log(`Listening on ${PORT}\n`))

const messages = [
  {
    channel: "1",
    account: "0xcA8Fa8f0b631EcdB18Cda619C4Fc9d197c8aFfCa",
    text: "Welcome to the Wasteland, survivor. This is VillageChat - your lifeline in the digital apocalypse."
  },
  {
    channel: "1",
    account: "0x1b3cB81E51011b549d78bf720b0d924ac763A7C2",
    text: "Anyone else hear that distant explosion? The grid's been unstable lately."
  },
  {
    channel: "1",
    account: "0x701C484bfb40ac628aFA487b6082f084B14AF0BD",
    text: "The radiation levels are dropping. Maybe we can venture out soon."
  },
  {
    channel: "1",
    account: "0x189B9cBd4AfF470aF2C0102f365FC1823d857965",
    text: "Found some old server parts in the ruins. Still functional after all these years."
  },
  {
    channel: "1",
    account: "0x176F3DAb24a159341c0509bB36B833E7fdd0a132",
    text: "The digital wasteland isn't so bad once you get used to it ;)"
  },
  {
    channel: "2",
    account: "0xcA8Fa8f0b631EcdB18Cda619C4Fc9d197c8aFfCa",
    text: "Welcome to the Village channel! Here we coordinate our settlements and share survival strategies."
  },
  {
    channel: "2",
    account: "0x1b3cB81E51011b549d78bf720b0d924ac763A7C2",
    text: "Survivor Ann here. Our settlement near the old data center is growing. Anyone want to join us?"
  },
  {
    channel: "2",
    account: "0x701C484bfb40ac628aFA487b6082f084B14AF0BD",
    text: "The village walls are holding strong. We've got power from the old solar panels."
  },
  {
    channel: "3",
    account: "0xcA8Fa8f0b631EcdB18Cda619C4Fc9d197c8aFfCa",
    text: "Resources channel - trade, barter, and share what you've scavenged from the ruins."
  },
  {
    channel: "3",
    account: "0x1b3cB81E51011b549d78bf720b0d924ac763A7C2",
    text: "Looking for medical supplies. Have fresh water to trade."
  },
  {
    channel: "3",
    account: "0x701C484bfb40ac628aFA487b6082f084B14AF0BD",
    text: "Found a cache of old electronics. Anyone need circuit boards?"
  },
  {
    channel: "3",
    account: "0x189B9cBd4AfF470aF2C0102f365FC1823d857965",
    text: "Trading: 5 liters of clean water for any working batteries."
  },
]

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000"
  }
})

io.on('connection', (socket) => {
  console.log('a user connected')

  socket.on('get messages', () => {
    io.emit('get messages', messages)
  })

  socket.on('new message', (msg) => {
    messages.push(msg)
    io.emit('new message', messages)
  })
})