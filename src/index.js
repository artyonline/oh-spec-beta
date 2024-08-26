require('dotenv').config();
const {Client, IntentsBitField} = require('discord.js');
const { CommandKit } = require('commandkit');
const mongoose = require('mongoose')
// Create a MongoClient with a MongoClientOptions object to set the Stable API version


const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ],
    allowedMentions: {parse: ['users', 'roles'], repliedUser: true}
});

new CommandKit({
    client,
    commandsPath: `${__dirname}/commands`,
    eventsPath: `${__dirname}/events`,
    bulkRegister: true,
  });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
})
async function run() {
    try {

        // const dbClient = new MongoClient(process.env.MONGO_URI, {
        //     serverApi: {
        //         version: ServerApiVersion.v1,
        //         strict: true,
        //         deprecationErrors: true,
        //     }
        // });

        // await dbClient.connect();

        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to DB")
        client.login(process.env.TOKEN)
    } catch (e) {
        console.error("Error in connecting to the Database: ", e)
    }
};

run();
