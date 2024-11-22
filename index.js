const fetch = require('node-fetch');
const TelegramBot = require('node-telegram-bot-api');
const { setIntervalAsync } = require('set-interval-async/dynamic');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  chatId: { type: String, required: true },
  cryptoName: { type: String, required: true },
  priceThreshold: { type: Number, required: true },
  customAlert: { type: Boolean, default: false }, // True if user set custom alert
});

const User = mongoose.model('User', userSchema);

const mongoURI = 'mongodb://localhost:27017/cryptoBot'; // Replace with your URI
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const TOKEN = '7659729955:AAERDXKjNjll6mMW7f2m5MLcjX1bmEqTtcM'; // Replace with your bot token
const bot = new TelegramBot(TOKEN, { polling: true });

// API keys for market data (example API)
const apiKeys = [
  '2bc4f529-dd2d-4dbe-8916-a779c679c02b',
];
let apiKeyIndex = 0;

// Get market data
async function getMarketData() {
  const url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest';
  const headers = {
    'Accepts': 'application/json',
    'X-CMC_PRO_API_KEY': apiKeys[apiKeyIndex],
  };

  try {
    const response = await fetch(url, { headers });
    if (response.status === 429) {
      console.log('Rate limit reached. Switching API key...');
      apiKeyIndex = (apiKeyIndex + 1) % apiKeys.length;
      return null;
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching market data:', error);
    return null;
  }
}

// Send a message to a user
async function sendMessage(chatId, text) {
  try {
    await bot.sendMessage(chatId, text);
  } catch (err) {
    console.error('Error sending message:', err);
  }
}

// Start the user conversation flow for setting a crypto alert
// Function to get market data (e.g., stock prices or cryptocurrency prices)
async function getMarketData() {
  const url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest';
  const headers = {
    'Accepts': 'application/json',
    'X-CMC_PRO_API_KEY': apiKeys[apiKeyIndex], // Cycling API keys
  };

  try {
    const response = await fetch(url, { headers });
    if (response.status === 429) {
      console.log('Rate limit reached. Switching API key...');
      apiKeyIndex = (apiKeyIndex + 1) % apiKeys.length;
      return null;
    }
    const data = await response.json();
    return data.data; // Return cryptocurrency data
  } catch (error) {
    console.error('Error fetching market data:', error);
    return null;
  }
}

// Function to check if the market data meets the user's requirements
async function checkMarketConditions() {
  const marketData = await getMarketData();
  console.log(marketData)
  if (!marketData) return;

  Object.keys(requirements).forEach((crypto) => {
    const userReq = requirements[crypto];
    const cryptoData = marketData.find((coin) => coin.name.toLowerCase() === crypto.toLowerCase());

    if (cryptoData) {
      const price = cryptoData.quote.USD.price;
      let sats = null;
      
      // If it's Bitcoin, convert the price to Satoshis
      if (crypto.toLowerCase() === 'bitcoin') {
        sats = Math.floor(price * 100000000);  // Convert price to Satoshis (1 BTC = 1 billion Sats)
      }
      
      // If user requirement is set, check and alert
      if (userReq.price && price < userReq.price) {
        const message = `ALERT: ${crypto} price has dropped below your set value!\n` + 
                        `Current Price: $${price.toFixed(2)}\n` +
                        (sats ? `Price in Sats: ${sats.toLocaleString()} Sats` : '');  // Show Sats only for Bitcoin
        sendMessage('YOUR_CHAT_ID', message);  // Replace with your chat ID
      }
    }
  });
}

// Function to start the user conversation flow
async function startRequirementFlow(msg) {
    const chatId = msg.chat.id;
  
    // Start conversation by asking for cryptocurrency name
    await bot.sendMessage(chatId, 'Please provide the cryptocurrency name you want to track (e.g., Bitcoin, Ethereum):');
    bot.once('message', async (message) => {
      const cryptoName = message.text.trim().toLowerCase();
  
      // Ask for the price threshold
      await bot.sendMessage(chatId, `Please provide the price threshold for ${cryptoName} (e.g., 30000 for $30,000):`);
  
      bot.once('message', async (priceMessage) => {
        const priceThreshold = parseFloat(priceMessage.text.replace(/,/g, '').trim());
  
        if (isNaN(priceThreshold)) {
          await bot.sendMessage(chatId, 'Invalid price! Please enter a valid number for the price threshold.');
          return;
        }
  
        // Save the user's requirement to MongoDB
        const user = new User({
          chatId: chatId.toString(),
          cryptoName: cryptoName,
          priceThreshold: priceThreshold
        });
  
        await user.save(); // Save to MongoDB
  
        // Fetch current market data (price)
        const marketData = await getMarketData();
        const cryptoData = marketData.find((coin) => coin.name.toLowerCase() === cryptoName);
  
        if (cryptoData) {
          const currentPrice = cryptoData.quote.USD.price;
  
          // Round the prices to two decimal places for better readability
          const roundedThreshold = priceThreshold.toFixed(2);
          const roundedCurrentPrice = currentPrice.toFixed(2);
  
          // Confirm the set requirement and current price
          await bot.sendMessage(chatId, `Your requirement has been set!\n\nTracking ${cryptoName} at price threshold: $${roundedThreshold}\nCurrent Price: $${roundedCurrentPrice}`);
  
          // Check if the current price is below the threshold and send an alert
          if (currentPrice <= priceThreshold) {
            await bot.sendMessage(chatId, `ALERT! The price of ${cryptoName} has dropped below your set threshold!\nCurrent Price: $${roundedCurrentPrice}`);
          }

          // If it's Bitcoin, send the price in Satoshis as well
          if (cryptoName === 'bitcoin') {
            const sats = Math.floor(currentPrice * 100000000);  // Convert to Satoshis
            await bot.sendMessage(chatId, `Current Price in Satoshis: ${sats.toLocaleString()} Sats`);
          }
        } else {
          await bot.sendMessage(chatId, 'Sorry, I could not fetch the current price of that cryptocurrency.');
        }
      });
    });
}


// Function to check market conditions (for automatic alerts and custom alerts)
async function checkPriceThreshold() {
  const marketData = await getMarketData();
  if (!marketData) return;

  // Find all users with a crypto price threshold
  const users = await User.find();

  users.forEach(async (user) => {
    const { chatId, cryptoName, priceThreshold, customAlert } = user;
    const cryptoData = marketData.find((coin) => coin.name.toLowerCase() === cryptoName.toLowerCase());

    if (cryptoData) {
      const currentPrice = cryptoData.quote.USD.price;
      const roundedCurrentPrice = currentPrice.toFixed(2);

      // If the price is below the threshold, send an alert
      if (currentPrice <= priceThreshold) {
        const alertMessage = `ALERT: The price of ${cryptoName} has dropped below your threshold!\nCurrent Price: $${roundedCurrentPrice}`;
        
        // Send automatic alert or custom alert based on user preference
        if (customAlert) {
          await sendMessage(chatId, `Custom Alert! ${alertMessage}`);
        } else {
          await sendMessage(chatId, `Automatic Alert! ${alertMessage}`);
        }
      }
    }
  });
}

// Start monitoring prices every minute
// setIntervalAsync(async () => {
//   await checkPriceThreshold();
// }, 60000);

// Command handler for /set
bot.onText(/\/set/, async (msg) => {
  await startRequirementFlow(msg);
});

// Command handler for /show
bot.onText(/\/show/, async (msg) => {
  try {
    const users = await User.find({ chatId: msg.chat.id });
    if (users.length === 0) {
      await bot.sendMessage(msg.chat.id, 'No requirements have been set yet.');
    } else {
      const user = users[0];
      await bot.sendMessage(msg.chat.id, `Your alert for ${user.cryptoName}: Threshold $${user.priceThreshold}`);
    }
  } catch (err) {
    console.error('Error sending /show message:', err);
  }
});

console.log('Bot is running...');
