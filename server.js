const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const database = require('./database');

const PORT = process.env.PORT || 3030;

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const startServer = async () => {
  try {
    await database.init();

    const app = express();
    app.use(cors());
    app.use(express.json());

    // REST API endpoints
    app.get('/api/channels', asyncHandler(async (req, res) => {
      const channels = await database.getChannels();
      res.json(channels);
    }));

    app.get('/api/channels/:id', asyncHandler(async (req, res) => {
      const channel = await database.getChannel(req.params.id);
      if (!channel) {
        return res.status(404).json({ error: 'Channel not found' });
      }
      res.json(channel);
    }));

    app.get('/api/user-tokens', asyncHandler(async (req, res) => {
      const tokens = await database.getActiveUserTokens();
      res.json(tokens);
    }));

    app.get('/api/messages/:channelId', asyncHandler(async (req, res) => {
      const messages = await database.getMessages(req.params.channelId);
      res.json(messages);
    }));

    app.post('/api/messages', asyncHandler(async (req, res) => {
      const { channelId, account, text, username } = req.body;
      const message = await database.addMessage({ channelId, account, text, username });
      res.json(message);
    }));

    app.post('/api/users', asyncHandler(async (req, res) => {
      const { account, username } = req.body;
      const user = await database.addUser({ account, username });
      res.json(user);
    }));

    // Error handler
    app.use((err, req, res, next) => {
      console.error('API error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });

    const server = app.listen(PORT, () => {
      console.log(`Listening on ${PORT}`);
    });

    const io = new Server(server, {
      cors: {
        origin: 'http://localhost:3000'
      }
    });

    // Socket.io events
    io.on('connection', (socket) => {
      console.log('a user connected');

      socket.on('get messages', async (channelId) => {
        try {
          const messages = await database.getMessages(channelId);
          socket.emit('get messages', messages);
        } catch (error) {
          console.error('Socket error (get messages):', error);
        }
      });

      socket.on('new message', async (msg) => {
        try {
          const message = await database.addMessage(msg);
          io.emit('new message', message);
        } catch (error) {
          console.error('Socket error (new message):', error);
        }
      });

      socket.on('join channel', async (channelId) => {
        try {
          socket.join(`channel-${channelId}`);
          const messages = await database.getMessages(channelId);
          socket.emit('get messages', messages);
        } catch (error) {
          console.error('Socket error (join channel):', error);
        }
      });

      socket.on('leave channel', (channelId) => {
        socket.leave(`channel-${channelId}`);
      });

      socket.on('disconnect', () => {
        console.log('user disconnected');
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();