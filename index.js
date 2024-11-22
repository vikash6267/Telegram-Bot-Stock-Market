const fetch = require('node-fetch');
const TelegramBot = require('node-telegram-bot-api');
const { setIntervalAsync } = require('set-interval-async/dynamic');

const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    chatId: { type: String, required: true },
    cryptoName: { type: String, required: true },
    priceThreshold: { type: Number, required: true }
  });
  
  const User = mongoose.model('User', userSchema);
  


const mongoURI = 'mongodb://localhost:27017/cryptoBot'; // Replace with your URI

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));


// Telegram Bot API Token
const TOKEN = '7659729955:AAERDXKjNjll6mMW7f2m5MLcjX1bmEqTtcM';

// User Requirements (to be set through the /set command)
let requirements = {}; 

const bot = new TelegramBot(TOKEN, { polling: true });

// API keys for market data (example API)
const apiKeys = [
  '2bc4f529-dd2d-4dbe-8916-a779c679c02b',
];
let apiKeyIndex = 0;

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Type /set To start!');
  });

  bot.onText(/\/set/, (msg) => {
    console.log("Received /set command:", msg);
    startRequirementFlow(msg);
  });
  
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
      if (userReq.price && price < userReq.price) {
        const message = `ALERT: ${crypto} price has dropped below your set value! Current price: $${price}`;
        sendMessage('YOUR_CHAT_ID', message);  // Replace with your chat ID
      }
    }
  });
}

// Function to send messages to users
async function sendMessage(chatId, text) {
  try {
    await bot.sendMessage(chatId, text);
  } catch (err) {
    console.error('Error sending message:', err);
  }
}

// Function to start the user conversation flow
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
        } else {
          await bot.sendMessage(chatId, 'Sorry, I could not fetch the current price of that cryptocurrency.');
        }
      });
    });
  }
  
  
  async function checkPriceThreshold() {
    const marketData = await getMarketData();
    // console.log(marketData)
    if (!marketData) return;
  
    // Find all users with a crypto price threshold
    const users = await User.find();
  
    // Loop through all users to check if the price meets their criteria
    users.forEach(async (user) => {
      const { chatId, cryptoName, priceThreshold } = user;
      const cryptoData = marketData.find((coin) => coin.name.toLowerCase() === cryptoName.toLowerCase());
  
      if (cryptoData) {
        const currentPrice = cryptoData.quote.USD.price;
        const roundedCurrentPrice = currentPrice.toFixed(2);
  
        // If the price is below the threshold, send an alert
        if (currentPrice <= priceThreshold) {
          const message = `ALERT: ${cryptoName} price has dropped below your set value! Current price: $${roundedCurrentPrice}`;
          sendMessage(chatId, message);
        }
      }
    });
  }
  
  // Set an interval to check prices every 20 seconds
//   setInterval(checkPriceThreshold, 20000); // 20000ms = 20 seconds
    
  
  

// Command handler for /set command
bot.onText(/\/set/, async (msg) => {
  await startRequirementFlow(msg);
});

// Command handler for /show command to display current requirements
bot.onText(/\/show/, async (msg) => {
  try {
    if (Object.keys(requirements).length === 0) {
      await bot.sendMessage(msg.chat.id, 'No requirements have been set yet.');
    } else {
      await bot.sendMessage(msg.chat.id, JSON.stringify(requirements, null, 4));
    }
  } catch (err) {
    console.error('Error sending /show message:', err);
  }
});

// Function to run the background task
function startMonitoring() {
  setIntervalAsync(async () => {
    await checkMarketConditions(); // Check the market conditions every minute
  }, 60000); // 60 seconds interval
}

// Start the monitoring task when the bot starts
startMonitoring();

console.log('Bot is running...');
