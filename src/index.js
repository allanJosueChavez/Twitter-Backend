'use strict'

const mongoose = require ("mongoose")
const { app, Listeneable_Host, Listeneable_Port } = require('./app');
const actual_date = new Date();

mongoose.Promise = global.Promise

function startExpressApp() {
    app.listen(Listeneable_Port, Listeneable_Host, () => {
        console.log(`[${actual_date}] => The Server is listening on http://${Listeneable_Host}:${Listeneable_Port}`);
    })
}

async function connectMongo() {
    try {
        await mongoose.connect('mongodb://localhost:27017/twitter-database', { useNewUrlParser: true, useUnifiedTopology: true })
        startExpressApp();
        process.on('SIGINT', async () => {
            try {
                await mongoose.disconnect()
                console.log(`[${actual_date}] ==> Server Closed`)
            } catch (error) {
                console.error(`[${actual_date}] ==> ${error.message}`);
            }
        })
    } catch (error) {
        console.error(`[${actual_date}] ==> ${error.message}`);
    }
}

connectMongo();