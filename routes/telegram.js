const express = require('express');
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const Sentiment = require("sentiment");
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const sentiment = new Sentiment();


async function initializeClient(app) {
  if (app.locals.client && app.locals.isAuthenticated) return app.locals.client;
  
  try {

    const client = new TelegramClient(
      new StringSession(process.env.TELEGRAM_SESSION || ""), 
      app.locals.apiId, 
      app.locals.apiHash, 
      {
        connectionRetries: 5,
      }
    );

    await client.start({
      phoneNumber: async () => process.env.TELEGRAM_PHONE || "",
      password: async () => process.env.TELEGRAM_PASSWORD || "",
      phoneCode: async () => process.env.TELEGRAM_CODE || "",
      onError: (err) => console.error("Telegram client error:", err),
    });

    console.log(" Telegram client initialized successfully!");
    app.locals.client = client;
    app.locals.isAuthenticated = true;
    return client;
  } catch (error) {
    console.error(" Failed to initialize Telegram client:", error);
    throw error;
  }
}

// Get groups endpoint
router.get('/groups', requireAuth, async (req, res) => {
  try {
    const telegramClient = await initializeClient(req.app);
    const dialogs = await telegramClient.getDialogs({});
    const groups = dialogs.filter((d) => d.isGroup).map((group, index) => ({
      id: index + 1,
      name: group.name,
      entity: group.entity
    }));

    res.json({ success: true, groups });
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch groups',
      details: error.message 
    });
  }
});

// Analyze group endpoint
router.post('/analyze', requireAuth, async (req, res) => {
  try {
    const { groupIndex } = req.body;
    
    if (!groupIndex) {
      return res.status(400).json({ 
        success: false, 
        error: 'Group index is required' 
      });
    }

    const telegramClient = await initializeClient(req.app);
    
    // Get groups
    const dialogs = await telegramClient.getDialogs({});
    const groups = dialogs.filter((d) => d.isGroup);
    const selectedGroup = groups[groupIndex - 1];

    if (!selectedGroup) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid group index' 
      });
    }

    // Calculate 7 days ago as Unix timestamp
    const daysAgo = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);

    const messages = [];
    let messageCount = 0;
    let oldMessageCount = 0;

    // Fetch messages
    for await (const msg of telegramClient.iterMessages(selectedGroup, { limit: 2000 })) {
      messageCount++;
      
      // Skip messages without text content
      if (!msg.message || msg.message.trim().length === 0) {
        continue;
      }
      
      // Check if message is from last 7 days
      if (msg.date >= daysAgo) {
        messages.push({
          id: msg.id,
          message: msg.message,
          date: msg.date,
          fromId: msg.fromId?.userId
        });
      } else {
        oldMessageCount++;
        // Stop after finding 10 consecutive old messages
        if (oldMessageCount >= 10) {
          break;
        }
      }
    }

    if (messages.length === 0) {
      return res.json({
        success: true,
        groupName: selectedGroup.name,
        message: 'No messages found in the last 7 days',
        data: {
          totalMessages: 0,
          recentMessages: 0,
          positive: 0,
          negative: 0,
          neutral: 0,
          uniqueUsers: 0
        }
      });
    }

    // Analyze sentiment and unique users
    const userIds = new Set();
    let positive = 0, negative = 0, neutral = 0;
    const sentimentScores = [];

    messages.forEach((msg) => {
      try {
        const result = sentiment.analyze(msg.message);
        sentimentScores.push(result.score);
        
        if (result.score > 0) positive++;
        else if (result.score < 0) negative++;
        else neutral++;

        if (msg.fromId) {
          userIds.add(msg.fromId.value);
        }
      } catch (error) {
        console.log(` Error analyzing message: ${error.message}`);
      }
    });


    res.json({
      success: true,
      groupName: selectedGroup.name,
      data: {
        totalMessages: messageCount,
        recentMessages: messages.length,
        positive,
        negative,
        neutral,
        positivePercentage: ((positive/messages.length)*100).toFixed(1),
        negativePercentage: ((negative/messages.length)*100).toFixed(1),
        neutralPercentage: ((neutral/messages.length)*100).toFixed(1),
        uniqueUsers: userIds.size
      }
    });

  } catch (error) {
    console.error('Error analyzing group:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to analyze group',
      details: error.message 
    });
  }
});

module.exports = router; 