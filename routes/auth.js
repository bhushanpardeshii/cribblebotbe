const express = require('express');
const { TelegramClient, Api } = require("telegram");
const { StringSession } = require("telegram/sessions");

const router = express.Router();

// in-memory cache { phone: { client, phoneCodeHash } }
const phoneCache = new Map();

// format phone with +91 prefix
const fmtnumber = (phoneNumber) => (phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`);

// uniform error response
const err = (res, msg, code = 400) => {
  res.status(code).json({ success: false, error: msg });
}

// Send code endpoint
router.post('/send-code', async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) return err(res, 'Phone number is required');

  const formattedPhone = fmtnumber(phoneNumber);
  try {
    const client = new TelegramClient(new StringSession(""), req.app.locals.apiId, req.app.locals.apiHash, { 
        connectionRetries: 5 
    });
    
    await client.connect();
    console.log("client connected");

    const { phoneCodeHash } = await client.sendCode({ 
        apiId: parseInt(req.app.locals.apiId), apiHash: req.app.locals.apiHash 
    }, formattedPhone);

    // cache the client and phoneCodeHash
    phoneCache.set(formattedPhone, { client, phoneCodeHash });
    return res.json({ success: true });
  } catch (e) {
    console.error('send-code', e);
    return err(res, e.errorMessage || 'Failed to send code');
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { phoneNumber, code } = req.body;
  if (!phoneNumber) return err(res, 'Phone number is required');
  if (!code) return err(res, 'Verification code is required');

  const formattedPhone = fmtnumber (phoneNumber);
  const cached = phoneCache.get(formattedPhone);
  if (!cached) return err(res, 'Please send code first');

  try {
    await cached.client.invoke(new Api.auth.SignIn({ 
        phoneNumber: formattedPhone, 
        phoneCodeHash: cached.phoneCodeHash, 
        phoneCode: code 
    }));

    // cache the client and phoneCodeHash
    req.app.locals.client = cached.client;
    req.app.locals.isAuthenticated = true;
    
    //clear the cache
    phoneCache.delete(formattedPhone);
    return res.json({ success: true });
  } catch (e) {
    console.error('login', e);
    return err(res, e.errorMessage || 'Login failed');
  }
});

module.exports = router; 