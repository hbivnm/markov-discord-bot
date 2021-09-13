require("dotenv").config();

const fs = require("fs");
const { Client } = require("discord.js");

// Init
const client = new Client();
client.login(process.env.BOT_TOKEN);

client.on("ready", () => {
    console.log(`[i] ${client.user.tag} has logged in!`);
    client.user.setActivity("your every move.", { type: "WATCHING"})

    console.log(client.channels.cache.get("538373899109400608").messages)

    /*
    client.channels.cache.get("538373899109400608")
        .fetchMessages({limit: 1})
        .then(messages => {
            console.log(`[${messages.first().author.name}]${messages.first().content}`)
        });
    */
})

function inPermittedChannel(channelName) {
	let config = JSON.parse(fs.readFileSync(__dirname + "/../bot-config.json"));
	if (config.permittedChannels.indexOf(channelName) > -1) return true;
	else return false;
}



client.on("message", (message) => {
    try {
        if (message.content[0] === "§" && inPermittedChannel(message.channel.name)) {
            switch(message.content.split(" ")[0]) {
                case "§ping":
                    message.reply("Pong!");
                    break;
            }
        }
    } catch (ex) {
        console.log(ex);
    }
})

