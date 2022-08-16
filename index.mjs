import { STATE } from './organisation/coop.mjs';
import Database from './organisation/setup/database.mjs';

import client from './organisation/setup/client.mjs';
import registerLogging from './organisation/setup/logging.mjs';

import eventsManifest from './operations/manifest.mjs';

import express from 'express';
import secrets from './organisation/setup/secrets.mjs';
import StockHelper from './operations/stock/stockHelper.mjs';

export default async function bot() {
    console.log('Trying to start bot');

    // Load secrets.
    await secrets();

    // Connect to PostGres Database and attach event/error handlers.
    await Database.connect();

    // Globalise the created client (extended Discordjs).
    const botClient = STATE.CLIENT = await client();

    // Indicate to initialisation backend logging.
    console.log('Starting bot on guild id: ' + process.env.GUILD_ID);

    // Login to Discord with the bot.
    await botClient.login(process.env.DISCORD_TOKEN);

    // Register community events.
    eventsManifest(botClient);
    
    // Register logging, debugging, errors, etc.
    registerLogging(botClient);

    // // Set activity.
    botClient.user.setActivity(`We need /help`, { type: 'WATCHING' });


    // Test stock announce.
    StockHelper.announce();

    // Make internal router work for accessing Discord server via API
    // const app = express();

    // app.get('/', (req, res) => {
    //     res.send('OK');
    // });

    // app.listen(5000);

    // Make load balancer work lol
}

bot();