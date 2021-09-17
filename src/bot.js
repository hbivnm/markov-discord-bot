require("dotenv").config();

const fs = require("fs");
const { Client } = require("discord.js");

// Init
const client = new Client();
client.login(process.env.BOT_TOKEN);

let dictionary;
fs.readFile("./dictionary.txt", "utf8", (err, data) => {
    if (err) {
        console.error(err);
        return err;
    }
    dictionary = data;
})

client.on("ready", () => {
	console.log(`[i] ${client.user.tag} has logged in!`);
	client.user.setActivity("your every move.", { type: "WATCHING" });
});

function inPermittedChannel(channelName) {
	let config = JSON.parse(fs.readFileSync(__dirname + "/../bot-config.json"));
    if (config.permittedChannels.indexOf(channelName) > -1)
        return true;
    else
        return false;
}

client.on("message", (message) => {
	try {
		if (inPermittedChannel(message.channel.name) && message.author.id != process.env.BOT_ID) {
			switch (message.content.split(" ")[0]) {
				case "§ping":
					message.reply("Pong!");
					break;
				case "§random":
                case "§rand":
                    message.reply(Math.floor(Math.random() * 100));
                    break;
                default:
                    if (Math.random() <= 0.10)
                        message.reply(getMarkovMessage())
                    break;
			}
		}
	} catch (ex) {
		console.log(ex);
	}
});

function getMarkovMessage() {
    //return "<a:SHUNGITE:713712006120734722>";
    let lines = dictionary.split('\n');
    let line = "";
    let markovsentance = "";

    let flag = true;
    while (flag) {
        line = lines[Math.floor(Math.random() * (lines.length + 1))];
        words = line.split(" ");

        console.log("line: " + line)

        for (let i = 0; i < words.length; i++) {
            if (Math.random() <= 0.5)
                markovsentance += words[i] + " ";
            else
                markovsentance += "";

            console.log("ms: " + markovsentance);
        }

        if (Math.random() >= 0.25)
            flag = !flag;
    }
    
    return markovsentance;
}

/*
    TODO:
        If user sends only an emote from the server, have a 10% to answer with same emote without tagging them
            ex.
            HbiVnm: FeelsOkayMan
            LeastInhumanBot: FeelsOkayMan

*/