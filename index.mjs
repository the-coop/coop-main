import { STATE } from './organisation/coop.mjs';
import Database from './organisation/setup/database.mjs';

import client from './organisation/setup/client.mjs';
import registerLogging from './organisation/setup/logging.mjs';

import eventsManifest from './operations/manifest.mjs';

import express from 'express';
import AWS from 'aws-sdk';

export default async function bot() {
    console.log('Trying to start bot');


    // Make internal router work for accessing Discord server via API
    const app = express();

    app.get('/', (req, res) => {
        res.send('OK');
    });

    app.listen(5000);

    // Make load balancer work lol

    // Get env variables into node/pm2?

    const region = "us-east-2";
    const secretName = "DB_CREDENTIAL";
    // secret,
    // decodedBinarySecret;

    // Create a Secrets Manager client
    const client = new AWS.SecretsManager({
        region: region
    });

    client.getSecretValue({ SecretId: secretName }, (err, data) => {
        if (err)
            console.log(err);
        else {
            console.log(data?.SecretString);
        }
        
        // Your code goes here. 
    });
















    // // Connect to PostGres Database and attach event/error handlers.
    // await Database.connect();

    // // Globalise the created client (extended Discordjs).
    // const botClient = STATE.CLIENT = await client();

    // // Indicate to initialisation backend logging.
    // console.log('Starting bot on guild id: ' + process.env.GUILD_ID);

    // // Login to Discord with the bot.
    // await botClient.login(process.env.DISCORD_TOKEN);

    // // Register community events.
    // eventsManifest(botClient);

    // // Register logging, debugging, errors, etc.
    // registerLogging(botClient);

    // // Set activity.
    // botClient.user.setActivity(`We need /help`, { type: 'WATCHING' });
}

bot();