import { 
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
	entersState,
	StreamType,
	AudioPlayerStatus,
	VoiceConnectionStatus,
    NoSubscriberBehavior
} from '@discordjs/voice';
import axios from "axios";
import { CHANNELS, ROLES, SERVER } from '../../organisation/coop.mjs';

export default class StockHelper {

    static US_OPEN = false;

    static async update() {
        console.log('stockhelper update');
        const now = new Date;

        now.setTime(now.getTime() + now.getTimezoneOffset() * 60 * 1000);

        const estOffset = -300; // Timezone offset for EST in minutes.
        const estDate = new Date(now.getTime() + estOffset * 60 * 1000);

        // Check if weekday.
        const isESTWeekday = ![0, 6].includes(estDate.getDay());

        // The NYSE is open from Monday through Friday 9:30 a.m. to 4:00 p.m. Eastern time.
        const afterOpen = (estDate.getHours() === 9 && estDate.getMinutes() >= 30) || estDate.getHours() > 10;
        const beforeClose = estDate.getHours() < 4;

        console.log('isESTWeekday', isESTWeekday);
        console.log('afterOpen', afterOpen);
        console.log('beforeClose', beforeClose);
        console.log('US_OPEN', this.US_OPEN);

        if (isESTWeekday) {

            if (!this.US_OPEN && afterOpen) {
                this.US_OPEN = true;
                
                // Ping opt in role.
                // CHANNELS._send('STOCKS_VC_TEXT', `${ROLES._textRef('MARKET_OPEN_PING')}, NYSE market open - good luck!`, {});

                // Give them 15 seconds to join before announcing after ping so they can catch it.
                setTimeout(() => {
                    // this.announce();
                }, 15000);
            }
    
            if (this.US_OPEN && !beforeClose) {
                this.US_OPEN = false;
    
                // Announce open at the end until another file created (testing).
                // this.announce();
            }
        }
    }

    static async getAlpha(ticker) {
        let tickerData = null;

        try {
            // Stock make Ticker work.
            const base = `https://www.alphavantage.co/query?`;
    
            // Provide a dropdown select for this?
            const duration = '5min';
    
            const params = [
                'function=TIME_SERIES_INTRADAY',
                'symbol=' + ticker,
                'interval=' + duration,
                `apikey=${process.env.ALPHA_VANTAGE_KEY}`
            ];
    
            const resp = await axios.get(base + params.join('&'));
    
            if (resp) {
                const data = resp.data;
        
                // TODO: Need to handle unrecognised.
        
                tickerData = {
                    meta: {},
                    price: {}
                };
        
                Object.keys(data).map(key => {
                    if (key === 'Meta Data') 
                        tickerData.meta = {
                            information: data[key]['1. Information'],
                            symbol: data[key]['2. Symbol'],
                            last_refreshed: data[key]['3. Last Refreshed'],
                            interval: data[key]['4. Interval'],
                            output_size: data[key]['5. Output Size'],
                            time_zone: data[key]['6. Time Zone']
                        }
                    else {
                        const priceKeys = Object.keys(data[key]);
                        const latestPrice = data[key][priceKeys[0]];
                        tickerData.price = {
                            open: Math.round(latestPrice['1. open']),
                            high: Math.round(latestPrice['2. high']),
                            low: Math.round(latestPrice['3. low']),
                            close: Math.round(latestPrice['4. close']),
                            volume: Math.round(latestPrice['5. volume'])
                        };
                    }
                });
            }
            
        } catch(e) {
            console.log('Error getting stock ticker data ' + ticker);
            console.error(e);
        }

        return tickerData;
    }

    static async announce() {
        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause
            }
        });
        
        const channel = CHANNELS._getCode('STOCKS_VC');

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            debug: true
        });
    
        await entersState(connection, VoiceConnectionStatus.Ready, 30e3);

        connection.subscribe(player);

        const url = 'https://www.thecoop.group/marketopen.mp3';

        // const resource = createAudioResource(url, {
        //     inputType: StreamType.Arbitrary
        // });

        const resource = createAudioResource(url);

        player.play(resource);
    
        entersState(player, AudioPlayerStatus.Playing, 5e3);
        
        // const botChan = CHANNELS._get('974458778495905872')

        // botChan.send('!clear-queue');
        // botChan.send(`!play ${url}`);
        
        // !clear-queue
        // !play ${url}


    }
}