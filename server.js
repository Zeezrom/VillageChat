const express = require('express');
const cors = require('cors');
const path = require('path');
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

    // Serve static files from the React app build directory
    app.use(express.static(path.join(__dirname, 'build')));

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

    app.post('/api/channels', asyncHandler(async (req, res) => {
      const { name, description, cost, isPublic, isAdmin, isOwner } = req.body;

      // Check if user is admin or owner
      if (!isAdmin && !isOwner) {
        return res.status(403).json({ error: 'Only admins or owners can create channels' });
      }

      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Channel name is required' });
      }

      const channel = await database.addChannel({
        name: name.trim(),
        description: description?.trim() || '',
        cost: cost || 0,
        isPublic: isPublic !== false
      });

      res.json(channel);
    }));

    app.get('/api/user-tokens', asyncHandler(async (req, res) => {
      const tokens = await database.getActiveUserTokens();
      console.log('📊 API Response - Active user tokens:', tokens);
      console.log('📊 API Response - Token count:', tokens.length);
      res.json(tokens);
    }));

    app.get('/api/user-tokens/all', asyncHandler(async (req, res) => {
      const tokens = await database.getAllUserTokens();
      console.log('📊 All user tokens (including inactive):', tokens);
      res.json(tokens);
    }));

    app.post('/api/user-tokens', asyncHandler(async (req, res) => {
      const { token, isActive = 1 } = req.body;
      if (!token) {
        return res.status(400).json({ error: 'Token address is required' });
      }
      const result = await database.addUserToken({ token, isActive });
      res.json(result);
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

    // Catch all handler: send back React's index.html file for client-side routing
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'build', 'index.html'));
    });

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
        origin: '*'
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