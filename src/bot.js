require("dotenv").config();

const fs = require("fs");
const { Client } = require("discord.js");
const MarkovChain = require("./MarkovChain.js")
const SillyFuncs = require("./SillyFuncs.js")

// Global
const ballquotes = ["don't count on it.", "as I see it, yes.", "it is certain.", "reply hazy, try again.", "my reply is no.", "most likely.", "it is decidedly so.", "ask again later.", "my sources say no.", "outlook good.", "without a doubt.", "better not tell you now.", "yes - definitely.", "cannot predict now.", "you may rely on it.", "concentrate and ask again.", "outlook not so good.", "signs point to yes.", "very doubtful.", "yes."];
let markov_message;
let boundary = 0.10;

// Init
const client = new Client();
client.login(process.env.BOT_TOKEN);

let dictionary;
let pure_dictionary_words;
//fs.readFile("./dictionary.txt", "utf8", (err, data) => {
//    if (err) {
//        console.error(err);
//        return err;
//    }
//    dictionary = data;
//    pure_dictionary_words = dictionary.split(" ");
//})

client.on("ready", () => {
	console.log(`[i] ${client.user.tag} has logged in!`);
    client.user.setActivity("your every move.", { type: "WATCHING" });
});

client.on("message", (message) => {
	try {
		if (inPermittedChannel(message.channel.name) && message.author.id != process.env.BOT_ID) { 
            console.log(`[i] Read new message in #${message.channel.name}: "${message.content}" (${message.content.length})`)
            if (isForbiddenMessage(message)) {
                message.delete()
                console.log(`[i] Deleted forbidden message by ${message.author.username}`)
            }

            let clean_message_content = "";
            let words_in_message_content = message.content.replace("§markov ", "").split(" ")
            if (words_in_message_content.length >= 3 && message.channel.name == "general") {
                words_in_message_content.forEach(word => {
                    if ((word[0] != "<" && word[word.length - 1] != ">") && word[0] != "§" && word != "" && word.indexOf("https://") == -1 && word.indexOf("http://") == -1)
                    clean_message_content += word + " "
                })
                clean_message_content = clean_message_content.substring(0, clean_message_content.length - 1)
                if (clean_message_content !== "") /*&& fs.readFileSync("./dynamic_dict.txt").indexOf(clean_message_content) == -1)*/ {
                    fs.appendFileSync("./dynamic_dict.txt", clean_message_content + "\r\n");
                }
            }

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
                        message.reply(SillyFuncs.get8Ball())
                    break;
                case "§ms":
                    if (message.channel.name == "bot-test")
                    {
                        if (message.content.length > 3)
                            message.channel.send(MarkovChain.getRelatedMessage(message.content.substring(4)))
                        else
                            message.reply("`§ms <TEST SENTANCE>`")
                    }
                    break;
                case "§markov":
                    if (message.channel.name == "bot-test")
                    {
                        if (message.content.length > 8) {
                            markov_message = MarkovChain.generateMarkovMessageV2(message.content.substring(8))
                            console.log(markov_message.split(" ").length)
                            if (markov_message.split(" ").length <= 2)
                                markov_message += " (would not be sent: too short!)"
                            if (markov_message == message.content.substring(8))
                                markov_message += " (would not be sent: matching!)"
                            message.channel.send(markov_message)
                        }
                        else
                            message.reply("`§markov <TEST SENTANCE>`")
                    }
                    break;
                default:
                    if (message.channel.name == "general") {
                        let rand = Math.random();
                        console.log(`[?] ${rand} < ${boundary}?`);
                        if (rand <= boundary && message.content.split(" ").length >= 2) {
                            console.log(`[!] Yes!`);
                            markov_message = MarkovChain.generateMarkovMessageV2(message.content)

                            if (markov_message.split(" ").length > 2) {
                                setTimeout(function(){message.channel.send(markov_message)}, 1000);
                                boundary -= 0.25;
                                if (boundary < 0.0) {
                                    boundary = 0.0;
                                }
                            }
                            else {
                                boundary = 1.0;
                            }
                        }
                        else {
                            console.log(`[!] No!`);
                            boundary += 0.015;
                        }
                    } else if (message.channel.name == "best-of-leastinhumanbot") {
                        if (message.content.length > 0) {
                            message.delete();
                            message.author.send("Only pictures are allowed in my hall of fame! :)")
                        }
                        else {
                            message.react('✅');
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

// Funcs
function isForbiddenMessage(message) {
    if (
        message.content.indexOf("https://tenor") != -1
        || message.content.indexOf("http://tenor") != -1
        || message.content.indexOf("https://media.discordapp.net/attachment") != -1
        || message.content.indexOf("http://media.discordapp.net/attachment") != -1
        || message.content.indexOf("https://cdn.discordapp.com/attachment") != -1
        || message.content.indexOf("http://cdn.discordapp.com/attachment") != -1
    ) {
        return true
    }

    return false
}

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
		case "doctorWTF":
			return "<:doctorWTF:782957393725620246>"
		case "docInsane":
			return "<:docInsane:850377679202025512>"
        case "sussy":
            return "<a:sussy:869594020672860180>"
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