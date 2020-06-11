require('dotenv').config();
const fetch = require('node-fetch');
const Config = require('./config');
const tmi = require('tmi.js');

const options = {
  options: {
    debug: true,
  },
  connection: {
    reconnect: true,
    secure: true,
  },
  identity: {
    username: process.env.TWITCH_BOT_CHANNEL_NAME,
    password: process.env.TWITCH_OAUTH_TOKEN,
  },
  channels: [Config.myChannel],
};

// Initialize tmi client.
const client = new tmi.client(options);

// Commands may not be used more than once every 10 seconds
const Cooldown = {
  cdownTime: Config.cdownTime * 1000,
  timestamps: {
    '!commands': null,
    '!discord': null,
    '!help': null,
    '!instagram': null,
    '!pb': null,
    '!schedule': null,
    '!twitter': null,
    '!youtube': null
  },

  usable: function(cmd){
    // this if statement is here in case i forget to add a key in this.timestamps for a new command
    // it will create a new key/value pair that will get updated by this.updateTimestamp
    if(!this.timestamps[cmd]){
      this.timestamps[cmd] = Date.now() - this.cdownTime;
      return this.timestamps[cmd] + this.cdownTime <= Date.now();
    }
    else {
      return this.timestamps[cmd] + this.cdownTime <= Date.now();
    }
  },

  updateTimestamp: function(cmd){
    this.timestamps[cmd] = Date.now();
  }
};

// Strings that are posted when the !help command is used
const help = [
  '!commands - Lists all available commands.',
  '!discord - Link to my Discord server.',
  '!help - Help.',
  '!instagram - Link to my Instagram.',
  '!pb - Link to my speedruncom page.',
  '!schedule - My current stream schedule.',
  '!twitter - Link to my Twitter.',
  '!youtube - Link to my YouTube.'
];

// Some commands only trigger every 20 minutes, if enough chat messages have happened
const Timer = {
  interval: Config.timerInterval * 60000,
  messages: 0,

  newMsg: function(){
    this.messages++;
  }
};

// Connect to chat, send message, and start interval for timer commands
client.connect();
client.on('connected', () => {
  client.action(Config.myChannel, 'connected.');
  setInterval(socials, Timer.interval);
});

// TIMER COMMAND
function socials(){
  if(Timer.messages >= Config.messageLimit && Config.useTimer){
    client.say(Config.myChannel, 'Follow me on Twitter and join my Discord! https://twitter.com/' + Config.twitter + ' | https://discord.gg/' + Config.discord);
    Timer.messages = 0;
  }
}

// CHAT COMMANDS
client.on('chat', (channel, user, message, self) => {
  if(self){
    return;
  }
  Timer.newMsg();

  // !commands
  if(message.toLowerCase() === '!commands'){
    const cmds = Object.keys(Cooldown.timestamps);
    if(Cooldown.usable('!commands')){
      let str = cmds.join(', ');
      client.say(Config.myChannel, 'The available commands are: ' + str);
      Cooldown.updateTimestamp('!commands');
    }
    return;
  }

  // !disconnect
  if(message.toLowerCase() === '!disconnect' && user.username === 'bramz'){
    client.say(Config.myChannel, 'Goodbye!');
    client.disconnect();
  }

  // !discord
  if(message.toLowerCase() === '!discord'){
    if(Cooldown.usable('!discord')){
      client.say(Config.myChannel, 'https://discord.gg/' + Config.discord);
      Cooldown.updateTimestamp('!discord');
    }
    return;
  }

  // !hack
  // if(message.toLowerCase() === '!hack'){
  //   if(Cooldown.usable('!hack')){
  //     client.say(Config.myChannel, 'This hack is called Nachos and Fried Oreos, made by GbreezeSunset and MiracleWater. https://www.smwcentral.net/?p=section&a=details&id=19044');
  //     Cooldown.updateTimestamp('!hack');
  //   }
  //   return;
  // }

  // !help
  if(message.toLowerCase().startsWith('!help')){
    const errorMessageLow = 'Not enough arguments! Try !help [command] instead.';
    const errorMessageHigh = 'Too many arguments! Try !help [command] instead.';
    let input = message.split(' ');
    if(input.length < 2){
      client.say(Config.myChannel, errorMessageLow);
      return;
    }
    if(input.length > 2){
      client.say(Config.myChannel, errorMessageHigh);
      return;
    }
    else{
      input[1] = input[1].replace(/!/, '');
      for(let i = 0; i < cmds.length; i++){
        if(input[1] === cmds[i].replace(/!/, '')){
          client.say(Config.myChannel, help[i]);
          return;
        }
      }
      client.say(Config.myChannel, `Couldn't find that command.`);
      return;
    }
  }

  // !instagram
  if(message.toLowerCase() === '!instagram'){
    if(Cooldown.usable('!instagram')){
      client.say(Config.myChannel, 'https://instagram.com/' + Config.instagram);
      Cooldown.updateTimestamp('!instagram');
    }
    return;
  }

  // !pb
  if(message.toLowerCase() === '!pb'){
    if(Cooldown.usable('!pb')){
      client.say(Config.myChannel, `You can find all my PBs on https://speedrun.com/${Config.speedruncom}.`);
      Cooldown.updateTimestamp('!pb');
    }
    return;
  }

  // !schedule
  if(message.toLowerCase() === '!schedule'){
    if(Cooldown.usable('!schedule')){
      client.say(Config.myChannel, 'I stream at 1pm EDT on Tuesdays, Thursdays, Fridays, Saturdays, and Sundays. Bonus streams could happen, but at random times.');
      Cooldown.updateTimestamp('!schedule');
    }
    return;
  }

  // !twitter
  if(message.toLowerCase() === '!twitter'){
    if(Cooldown.usable('!twitter')){
      client.say(Config.myChannel, 'https://twitter.com/' + Config.twitter);
      Cooldown.updateTimestamp('!twitter');
    }
    return;
  }

  // !youtube
  if(message.toLowerCase() === '!youtube'){
    if(Cooldown.usable('!youtube')){
      client.say(Config.myChannel, 'https://youtube.com/' + Config.youtube);
      Cooldown.updateTimestamp('!youtube');
    }
    return;
  }
});
