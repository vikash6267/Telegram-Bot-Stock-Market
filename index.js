const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const { Worker, isMainThread, parentPort } = require('worker_threads');
const { setIntervalAsync } = require('set-interval-async/dynamic');

// Telegram Bot API Token
const TOKEN = '7659729955:AAERDXKjNjll6mMW7f2m5MLcjX1bmEqTtcM';
const CHAT_ID = '1185704279';  // Replace with your target chat ID
const api_keys = [
  '6b25a9637f399a23f63444bd09cd6fef3d6c259df750ad8004cc2e9948e79eec',
  'd68727dacaeb49c724dc4e38c59d024347d7a4bb208e64b1f4676954760799db',
  'c740307b7d7eac01026a4057e8faab1d9b87dbca689c9d09dd4c1efb825e47a4',
  'd055c73178697fa085d53f418b290e2d2c153ff4e19f66c967114eb417b04aba',
  '99aac38746873ce222244cdcc8f69881ced7a6613b79002b93e6ea62f2c0c98a',
  '8c5fa50eda0e1494dd8c0a7fd7cefc6d643702b7d2fb59002ba1ef5202afcb04',
  '5355e4a1735abcd5b6c171d5cb713f511187b945d34bc66bb5e046dc8b5bdb22',
  'c4ac5f1e179a01e31709e917378681f06a8e1e29ff334f9663cf0cf578d3413d',
  '8e4b16489b8a4f790b78400291e4b41caede79cbe311221cb6e8e994ea6846db',
  '83c3b3b666bbb19ff2ad4b063135a25ad5c831c6d48c89898e434976690b1fe6',
  'c5502f19cf6300f20bf8040d00a4b345dae950f616fb8be1d40e89d035f9ec22',
  '311e71c6bf91d2ba3151b365e40e1949a95922deb26013e9966fbeeafdef0460',
  '9fe3acbf4b62ef95e72134b8605cd0149d9e0af654c872dc4636bbc6d1248012',
  '58a50200e83de91f96eb86f28b8583105f1867c8cb0e0c0bcbd43c8adc7d7747',
  'ba58e735c3330a97262435247ce4c9b809f637fb897af33e81abc0a633fa5618',
  'a28a9f293ff4ed42bb9dbad82e01ba36bb80d3e5522f778ab84e868689ece3b7',
  '4da2035241ab5882ba8ebbbf081f2415a36bbe7858d92ffd447c57250ada7e2b',
  '4f249f3d6690e03917b506440812829b63da213b4279f94d24464c117c48e272',
  'ec709dff2690df773102908ce04b2e21053f78b62babbd95429a162d2e81676d',
  '175ab4765bf6afc340d28d4f4a229512514329f551128c3dcd2ca78980b75f4f',
  '88ded261ccccff844beee417a5f41aaeeb4b68585e9ed8d41947c8fceb282be0',
  'fcd97030e38c61c60c58a5de08904dc0db0ae88cafa6a325a2be31f39b017b1d'
];

const api_keys_gen = api_keys[Symbol.iterator]();

// Initialize the bot
const bot = new TelegramBot(TOKEN, { polling: true });

let requirements = {};

// Show requirements command
bot.onText(/\/show/, (msg) => {
    bot.sendMessage(msg.chat.id, JSON.stringify(requirements, null, 4));
});

// Set requirements command
bot.onText(/\/set (.+)/, (msg, match) => {
    try {
        const param = match[1].split(',').map((item) => item.trim().split(' '));
        const newRequirements = {};

        param.forEach((i) => {
            if (i.length === 2) {
                newRequirements[i[0]] = '$' + parseFloat(i[1]);
            } else {
                newRequirements[i[0]] = null;
            }
        });

        requirements = newRequirements;
        bot.sendMessage(msg.chat.id, `Requirements set successfully.\n\n\n${JSON.stringify(requirements, null, 4)}`);
    } catch (error) {
        bot.sendMessage(msg.chat.id, `Error: ${error.message}`);
    }
});

// Function to get conversion factor (similar to the get_convertion_factor in Python)
async function getConversionFactor() {
    const url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest';
    const params = {
        'start': '1',
        'limit': '5',
        'convert': 'USD'
    };
    const headers = {
        'Accepts': 'application/json',
        'X-CMC_PRO_API_KEY': '2bc4f529-dd2d-4dbe-8916-a779c679c02b',
    };

    try {
        const response = await axios.get(url, { params, headers });
        return response.data.data[0].quote.USD.price / 100_000_000;
    } catch (error) {
        console.error('Error fetching conversion factor:', error.message);
        return 0.0;
    }
}

// Function to get message (equivalent of the get_message in Python)
async function getMessage(prevInscriptions, tick, value) {
  const url = 'https://open-api.unisat.io/v3/market/brc20/auction/list';
  const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${api_keys_gen.next().value}`,
  };

  const payload = {
      'filter': {
          'nftType': 'brc20',
          'isEnd': false,
          'tick': tick,
      },
      'sort': {
          'unitPrice': 1,
      },
      'start': 0,
      'limit': 1,
  };

  try {
      const response = await axios.post(url, payload, { headers });
      console.log(response.data); // Log the entire response to inspect it
      const inscription = response.data.data.list[0];
     
      if (!inscription) {
          console.error(`No inscription found for tick ${tick}`);
          return null;
      }

      if (!prevInscriptions[tick] || prevInscriptions[tick][0] !== inscription.inscriptionNumber || prevInscriptions[tick][1] !== inscription.unitPrice) {
          prevInscriptions[tick] = [inscription.inscriptionNumber, inscription.unitPrice];
          const conversionFactor = await getConversionFactor();
          if (value) {
          
            
              if (inscription.unitPrice * conversionFactor < parseFloat(value.slice(1))) {
                  return `Tick: ${tick}\nQuantity: ${inscription.amount}\nUnit Price: $${inscription.unitPrice * conversionFactor}\nTotal Price: $${inscription.price * conversionFactor}\nInscription Number: ${inscription.inscriptionNumber}\n\n\n`;
              }
          } else {
              return `Tick: ${tick}\nQuantity: ${inscription.amount}\nUnit Price: $${inscription.unitPrice * conversionFactor}\nTotal Price: $${inscription.price * conversionFactor}\nInscription Number: ${inscription.inscriptionNumber}\n\n\n`;
          }
      }
  } catch (error) {
      console.error('Error fetching auction data:', error);
      return null;
  }
}



// Function to process and send final messages
async function messageSender() {
    const prevInscriptions = {};

    setIntervalAsync(async () => {
        if (Object.keys(requirements).length === 0) {
            await bot.sendMessage(CHAT_ID, "Set Requirements First!");
            return;
        }

        let message = '';
        for (let [tick, value] of Object.entries(requirements)) {
    
            const msg = await getMessage(prevInscriptions, tick, value);
            if (msg) {
                message += msg + "\n\n\n";
            }
        }

        if (message) {
            try {
                await bot.sendMessage(CHAT_ID, "ORDINALS\n\n\n" + message);
            } catch (error) {
                console.error("Error sending message:", error.message);
            }
        }
    }, 4500);  // Adjust the interval time based on your requirement
}

messageSender();  // Start the message sender

// Start the bot
console.log("Bot is running...");
