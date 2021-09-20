require("dotenv").config();

const fs = require("fs");
const { Client } = require("discord.js");

// Global
const ballquotes = ["don't count on it.", "as I see it, yes.", "it is certain.", "reply hazy, try again.", "my reply is no.", "most likely.", "it is decidedly so.", "ask again later.", "my sources say no.", "outlook good.", "without a doubt.", "better not tell you now.", "yes - definitely.", "cannot predict now.", "you may rely on it.", "concentrate and ask again.", "outlook not so good.", "signs point to yes.", "very doubtful.", "yes."];
let markovMessage;
let boundary = 0.10;

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
            console.log("Channel: " + message.channel.name + " Content: " + message.content + " (" + message.content.length + ")")
			switch (message.content.split(" ")[0]) {
				case "§ping":
					message.reply("Pong!");
					break;
				case "§random":
                case "§rand":
                    message.reply(Math.floor(Math.random() * 100));
                    break;
                case "§8ball":
                    if (message.channel.name == "8ball")
                        message.reply(get8Ball())
                    break;
                case "§ms":
                    if (message.channel.name == "bot-test")
                        setTimeout(function(){message.reply(getMarkovMessage())}, 500)
                    break;
                default:
                    if (message.channel.name == "general") {
                        let rand = Math.random();
                        console.log("Rolled (boundary): ", rand, "("+boundary+")");
                        if (rand <= boundary) {
                            boundary -= 0.25;
                            if (boundary < 0.0001)
                                boundary = 0.0
                            setTimeout(function(){message.reply(getMarkovMessage())}, 500)
                        }
                        else {
                            boundary += 0.025;
                        }
                    } else if (message.channel.name == "best-of-leastinhumanbot") {
                        if (message.content.length > 0) {
                            message.delete();
                            message.author.send("Only pictures are allowed in my hall of fame! :D")
                        }
                        else {
                            message.react('✔️');
                            message.react('❌');
                        }
                    }
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
    let lines = dictionary.split('\n');
    let line = "";
    let markovsentance = "";

    let flag = true;
    while (flag) {
        line = lines[Math.floor(Math.random() * (lines.length + 1))];
        words = line.replace("\n", "").replace("  ", " ").replace("\r", "").split(" ");

        console.log("line: " + line)

        let wordsToTake = Math.floor(Math.random() * ((words.length - 1) - 2) + 2)

        for (let i = 0; i < wordsToTake; i++)
            if (Math.random() <= 0.95) {
                markovsentance += getEmoteIfExist(words[i]) + " ";
            }

        if (Math.random() >= 0.7 && (markovsentance != undefined && markovsentance != NaN && markovsentance != "" & markovsentance != " "))
            flag = false;
    }
    
    console.log("Returning: ", markovsentance)
    console.log("Length: ", markovsentance.length)

    return markovsentance.replace("\n", "").replace("  ", " ").replace("\r", "");
}

function getEmoteIfExist(word) {
    switch (word) {
        case "tf":
            return "<:tf:839473497290047528>"
        case "OMEGALUL":
            return "<:OMEGALUL:800144542031544351>"
        case "MegaLuL":
            return "<:MegaLuL:845295410222071839>"
        case "PogU":
            return "<:PogU:540485322518036490>"
        case "PogO":
            return "<:PogO:702106081740193853>"
        case "Pog":
            return "<:Pog:568197265987207209>"
        case "WeirdChamp":
            return "<:WeirdChamp:538374298700742696>"
        case "LULW":
            return "<:LULW:539809545128509440>"
        case "amongE":
            return "<:amongE:889172223724765235>"
        case "bananal":
            return "<:bananal:889287118935953459>";
        default:
            return word;
    }
}

/*
    TODO:
        If user sends only an emote from the server, have a 10% to answer with same emote without tagging them
            ex.
            HbiVnm: FeelsOkayMan
            LeastInhumanBot: FeelsOkayMan

*/