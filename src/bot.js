require("dotenv").config();

const fs = require("fs");
const { Client } = require("discord.js");

// Global
const ballquotes = ["don't count on it.", "as I see it, yes.", "it is certain.", "reply hazy, try again.", "my reply is no.", "most likely.", "it is decidedly so.", "ask again later.", "my sources say no.", "outlook good.", "without a doubt.", "better not tell you now.", "yes - definitely.", "cannot predict now.", "you may rely on it.", "concentrate and ask again.", "outlook not so good.", "signs point to yes.", "very doubtful.", "yes."];
let markovMessage;

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
                case "§8ball":
                    message.reply(get8Ball())
                    break;
                case "§ms":
                    if (message.channel.name == "bot-test")
                        setTimeout(function(){message.reply(getMarkovMessage())}, 500)
                    break;
                default:
                    let rand = Math.random();
                    console.log("Rolled: ", rand);
                    if (rand <= 0.10)
                        setTimeout(function(){message.reply(getMarkovMessage())}, 500)
                    break;
			}
		}
	} catch (ex) {
		console.log(ex);
	}
});

function get8Ball() {
    return ballquotes[Math.floor(Math.random() * (ballquotes.length + 1))];
}

function getMarkovMessage() {
    console.log("\nGetting markov message...")
    //return "<a:SHUNGITE:713712006120734722>";
    let lines = dictionary.split('\n');
    let line = "";
    let markovsentance = "";

    let flag = true;
    while (flag) {
        line = lines[Math.floor(Math.random() * (lines.length + 1))];
        words = line.replace("\n", "").replace("  ", " ").replace("\r", "").split(" ");

        console.log("line: " + line)

        for (let i = 0; i < words.length; i++)
            if (Math.random() <= 0.5 /*&& words[i] != "NaN" && words[i] != "\n" && words[i] != "\r" && words[i] != "" && words[i] != undefined*/)
                markovsentance += words[i] + " ";

        if (Math.random() >= 0.5 && (markovsentance != undefined && markovsentance != NaN && markovsentance != "" & markovsentance != " "))
            flag = false;
    }
    
    console.log("Returning: ", markovsentance)
    console.log("Length: ", markovsentance.length)

    return markovsentance.replace("\n", "").replace("  ", " ").replace("\r", "");
}

/*
    TODO:
        If user sends only an emote from the server, have a 10% to answer with same emote without tagging them
            ex.
            HbiVnm: FeelsOkayMan
            LeastInhumanBot: FeelsOkayMan

*/