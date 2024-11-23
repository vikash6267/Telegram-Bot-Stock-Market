const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const { setIntervalAsync } = require('set-interval-async/dynamic');

// Telegram Bot API Token
const TOKEN = '7691880955:AAHPw6FxY0DEV5Ul04w3EXWTJaLcWP8QfMg';
// const CHAT_ID = '1185704279'; //viaksh
// const CHAT_ID = '1593806971';  // aayush 
const CHAT_ID = '6143069070';  // client 
const api_keys = [
    '6b25a9637f399a23f63444bd09cd6fef3d6c259df750ad8004cc2e9948e79eec',
    '676f7173d23d405ae14a5853722b2e6fb90f170bdec5984f35c48f5b1936de11',
    'f8fa8587106cc774edf926b3213c4e07a5d08d8a65cf1835eb3ad2118b558e8a',
    '350d0d6d30b1de8e9c8fcb33ea37182fb76809758825e8c38a8f6675e1f0fd48',
    '5aa310d19c0605bfda3e0d003a645a7bf82c9533caa93fb625edbcceb338a05f',
    'bfa0ad5c0a4920499bf56a593087cbf4f3e374fa6d14d256cfce2c11f8c656e3',
    'a198cd1faebbf69c8bb239021c66ffdecf5ca2ea9ec36628bb8fe0753dade3e3',
    
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
    '88ded261ccccff844beee417a5f41aaeeb4b68585e9ed8d41947c8fceb282be0',
    'fcd97030e38c61c60c58a5de08904dc0db0ae88cafa6a325a2be31f39b017b1d',
  
      '93654c6d1d7a4894242147a8e1a102f04047d869c70bf13d1b2b317a2ac6d1fb',
    '3347945c3e532f0295e7a786072382c49b92372087e1f193dd82586649e16f21',
    'b4ac73e8ddce26c3b96d7173c10d0ffdecbd34cf9f17af8bd090979cd958d0ad',
    'eb6d380268b19c2d9b9a18cd60a48f0aef1ce222f8840a2ff8745a33121b6a08',
    '0d053671240536da7fbb16603fbc546a62d1336df90f293c68b9426aedeb44ca',
    'aafbb0f0b73a4fb31e716b70c7dbf751116ccbe78b5deff6c84ac3c9bb622caf',
    '58250b2d5428edd150088690259da4ff0e7c9ca3c5c329284ecd6efb9076a808',
    '01ff21444aeddfc5c4875d01d1d80b7bca45f0df8e265f209b192acd823a0ff0',
    'df32dd910ba95152ff871ee6dca831afdf0e8ad0fd236c4b292bb1e95be529d9',
    'bd1acdac826cb5ddfaec2cad6c7e8d1426ef1bef046273c42fadb4d5dc59529c',
    '270387fb3fa2ea06a5a6f99dde982ed4636e48ff665b6b253c93b1f7b9e49242',
    '6b92d718fe97f8d619e4b21846a15c2ce0f1b94085ec1e2ff8fbb66a40ffe9df',
    '83af13b1ed6766a5bfe3e0cb7ea80cbd10771361899e0b409bf59c12349d82aa',
    'b73167f5b35a4948ac60516d8c2bad6bd75a45ed338a0fb96b7c7f6917aa75d0',
    '55a334e79ebeadf441e7157d2ef299c6ff128c95bfb58f5d650b275d24b81d89',
    'ef71fb26534a66be95a23713c375fb7c5d6e5f7bab2da20596bd1aaf184cb129',
    'f2cf08ae10ccabd1999b937234ed3ae5396d996723e623ecfb89e89c54cf065f',
    'f8f84856a8b8b64e90a0b35aad055c0bbbd25672bd267f284589fdd7ad13d9d4',
    '3d499d5e99bdca589702113a99393d3a5ab48cb407b8cb89ac201868192c64cd',
    'dcad58b767f6819beaca34568dcd296156e58d6af072abaef9f00819b4c402f0',
    '442b8755fdeb315339456011416f6a1cebd7b558d646f632955920454bb10882',
    'a6a0ac6f3d262c4ee0db462f32afb993037a26791e07d8182dfcdd89abe7a42e',
    'c17168107e3deac2c6bdc8d54b9cf4fa2bd2dfa5f74deb558bfe1fc9beba4725',
    'ed9fd6160e2c93869f9df18f21f6fbde1dbb58fd9d774cef918fd2037a733967',
    'e419a22deccaa8485f6f9138548d01a9464a6188239e6e7ea2dbd77058136278',
    '3df105de46eee11620ecab5b7fb9541fbbfb3dc2bec7aeba4109d513cd231fee',
    '58c5f088af1d7c37c324e10f65eaea4bf081b46896344127eff2139633e262b4',
    '92627ab93776604644b0bc504156ceb4ab1ab6fea0cb408dc1695261dc807c9f',
    'c06cd296bd4f6cc6b34c22df1f68712e84aa3ea14a53b86a68f55740efad4d88',
    'bc4a21c2129f432c2faed9039ad9cc0ba18a9da779471ed9df69c0ed050e8994',
    '7d7f9b28559e2d9d0bb35d396e7ec08bc9102778711ec82100c333c04456c1c7',
    'e1243e192f8fc4895ae919cf4e9845e79491f3834446c1deaa6edc588fc175f0',
    'e502beb4e419ff11b29c6654e4dcff1c449c1fd8d544dfc8b734241226f40af0',
    '71b508d4a4e467743bd9e6a1ebb59ddbfc3f21969265af9cb94553c981114fc2',
    '3cf690a45ed6606e6a3905e53a573c54342fed4de225495b14466b552252b687',
    '599765ed833b3b3d05fca79f622d8587595674b3cc4271640c84c97ae6a54810',
    'f40345eb3ac5af0c295397cc17673924c16c2ed07cd46ff2543298cdc62de5c0',
    '97afed70e776b1247ba2ef1120bb994ce484fb5d278cb24e36e58cf3531f0abf',
    '406d7208e02cc058385951fc058780f3077e3cb743384270b46b7ae99e893337',
    '6d7d9af91fa889e8c89ea2b74d6896f244928294e4876b358d062558843b7524',
    '4b9aee52c7e773d7ee200dc9885ecfde40ce278900dbd173b59f53ad534caed1',
    '32c18a3e60126ab83dbb0aa026d684ec296a09196b5610086bf5938f58718457',
    '5e97cff44beffeccc37c6138d25d1c87f7fe64746ad10e375b4c428f0ac38e16',
    'a437c67b944778dbd51a588583473946054a0743f499d10d64c2d74fb0969c6b',
    '37896a2be319ee075eca4bc13c24db22f57564bca958da34d5d76d24a976ef8e',
    '84b09716f24f6d507d12526e160cabe4fab5971774361ecc914259c3572013f3',
    '4565baddf5fe10ce2666935c6d03aa68c7c9079814c46e5202b226ee9bf2fc83',
    '91db9b94aa12e15d6372de5c4058646c65e931e6f54cdb8b1d92086dec651ef9',
    '650ac28e362f5cfe6d38edb8a22a9914b6c3d70e57ca8d0c5fdb0632e4a899e1',
    'aaa4d7c5bb3d5218a3aa2d944c50dbacfc94def3077a5dd600a66f3b6154ac31',
    '0fbc8e4651b6bef2ba67170d5bb921be6af5258a3c44aee36bcc31611e448042',
  
    
   
  
  
   
  ];
  const api_keys_gen = {
    [Symbol.iterator]() {
      let index = 0; // Start at the first index
      return {
        next() {
          if (index >= api_keys.length) {
            index = 0; // Reset to the beginning when reaching the end
          }
          return { value: api_keys[index++], done: false }; // Always return done: false
        }
      };
    }
  };
  const iterator = api_keys_gen[Symbol.iterator]();


// Initialize the bot
const bot = new TelegramBot(TOKEN, { polling: true });

let requirements = {};

// Show requirements command
bot.onText(/\/show/, (msg) => {
    bot.sendMessage(msg.chat.id, JSON.stringify(requirements, null, 4));
});



// Replace 'YOUR_BOT_TOKEN' with your actual bot token from BotFather

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // Clear the requirements
    requirements = {};

    console.log(chatId);
    bot.sendMessage(
        chatId, 
        `Welcome! All previous settings have been cleared.\n\nType /set item quantity(500), items2 quantity(1000) to set new requirements.`
    );
});

bot.onText(/\/reset/, (msg) => {
    const chatId = msg.chat.id;

    // Clear the requirements
    requirements = {};

    console.log(`Requirements have been reset by user with chat ID: ${chatId}`);

    bot.sendMessage(
        chatId, 
        `All previous settings have been cleared.\n\nYou can now set new requirements using:\n/set ticker price(500), ticker price(1000)`
    );
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
    console.log(iterator.next().value)
  const url = 'https://open-api.unisat.io/v3/market/brc20/auction/list';
  const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${iterator.next().value}`,
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
    }, 6000);  // Adjust the interval time based on your requirement
}

messageSender();  // Start the message sender

// Start the bot
console.log("Bot is running...");
