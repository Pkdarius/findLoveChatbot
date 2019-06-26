const express = require('express');

const PORT = process.env.PORT || 1337;

const app = express();

const messengerWebhookRoute = require('./routes/messengerWebhookRoute');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(messengerWebhookRoute);

app.listen(PORT, () => console.log('Webhook is listening!'));