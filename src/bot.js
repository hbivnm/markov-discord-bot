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
                    {
                        if (message.content.length > 3)
                            //message.reply(getMarkovMessage(message.content.substring(4)))
                            message.channel.send(getMarkovMessage(message.content.substring(4)))
                        else
                            message.reply("`§ms <TEST SENTANCE>`")
                    }
                    break;
                default:
                    if (message.channel.name == "general") {
                        let rand = Math.random();
                        console.log("Rolled (boundary): ", rand, "("+boundary+")");
                        if (rand <= boundary) {
                            boundary -= 0.25;
                            if (boundary < 0.0001)
                                boundary = 0.0
                            setTimeout(function(){message.channel.send(getMarkovMessage(message.content))}, 1000)
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

function getMarkovMessage(userMessage) {
    console.log("\nGetting markov message...\n")
    let lines = dictionary.split('\n');
    let markovsentance = "";

    let failedFindings = 0;

    let relatedWords = userMessage.split(" ");
    let relationQuotaInc = 1 / relatedWords.length;

    while (true) {
        let relationQuota = 0.0;
        
        let line = lines[Math.floor(Math.random() * (lines.length + 1))];
        if (line == undefined)
            continue;

        let words = line.replace("\n", "").replace("  ", " ").replace("\r", "").split(" ");

        relatedWords.forEach(word => {
            
            let wordSplit = word.split(":")
            if (wordSplit[0].startsWith("<") && wordSplit[2].endsWith(">"))
                word = wordSplit[1]

            if (line.includes(word))
                relationQuota += relationQuotaInc;
        });

        
        if (relationQuota < 0.2 && failedFindings < 50000) {
            failedFindings++;
            continue;
        }

        console.log("Line: " + line)
        console.log("Relation Q.: " + relationQuota + "\n")

        let wordsToTake = 0;
        let startingIndex = 0;

        wordsToTake = Math.floor(Math.random() * ((words.length - 1) - 2) + 2);
        //console.log("wordsToTake: " + wordsToTake)
        if (wordsToTake != 0) {

            if (words.length > 1 && wordsToTake != 1)
                startingIndex = Math.floor(Math.random() * ((wordsToTake - 1) - 2) + 2) - 1;

            //console.log("startingIndex: " + startingIndex)
            
            for (let i = startingIndex; i <= wordsToTake - 1; i++)
               markovsentance += getEmoteIfExist(words[i]) + " ";
        }

        if (Math.random() <= 0.85 && (markovsentance != undefined && markovsentance != NaN && markovsentance != "" & markovsentance != " " && markovsentance.length != 0))
            break;
    }
    
    console.log("Lines searched: " + failedFindings);
    console.log("Returning: ", markovsentance);
    console.log("Length: ", markovsentance.length);

    return markovsentance.replace("\n", "").replace("   ", " ").replace("  ", " ").replace("\r", "");
}

// Funcs
function inPermittedChannel(channelName) {
	let config = JSON.parse(fs.readFileSync(__dirname + "/../bot-config.json"));
    if (config.permittedChannels.indexOf(channelName) > -1)
        return true;
    else
        return false;
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
        case "LULE":
            return "<:LULE:915291048404742154>"
        case "amongE":
            return "<:amongE:889172223724765235>"
        case "bananal":
            return "<:bananal:889287118935953459>"
        case "forsenE":
            return "<:forsenE:890572318496153670>"
        case "forsenScoots":
            return "<:forsenScoots:890572596184231978>"
        case "forsenCD":
            return "<:forsenCD:800144591021015042>"
        case "WifeCheck":
            return "<a:WifeCheck:745316201814818916>"
        case "Clueless":
            return "<:Clueless:902251055948128286>"
        case "ZULUL":
            return "<:ZULUL:539103934392827925>"
        case "NOIDONTTHINKSO":
            return "<a:NOIDONTTHINKSO:915295008318451713>"
        case "YESIDOTHINKSO":
            return "<a:YESIDOTHINKSO:915295191013924896>"
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