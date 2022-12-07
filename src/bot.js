require("dotenv").config();

const fs = require("fs");
const { Client } = require("discord.js");
const MarkovChain = require("./MarkovChain.js")
const SillyFuncs = require("./SillyFuncs.js")
const super_admin_id = "257951111879589890"

// Global
let markov_message;
let boundary = 0.10;
let guarantee_hit = false;
let forbidden_user_ids = []

// Init
forbidden_user_ids = fs.readFileSync("./forbidden_user_ids.txt").toString().split("\r\n");

const client = new Client();
client.login(process.env.BOT_TOKEN);

client.on("ready", () => {
	console.log(`[i] ${client.user.tag} has logged in!`);
    client.user.setActivity("your every move.", { type: "WATCHING" });
});

client.on("message", (message) => {
	try {
		if (inPermittedChannel(message.channel.name) && message.author.id != process.env.BOT_ID) { 
            console.log(`[i] Read new message in #${message.channel.name}: "${message.content}" (${message.content.length})`)
            if (isForbiddenMessage(message.content) && message.channel.name != "video-gif-img-spam") {
                message.delete()
                console.log(`[i] Deleted forbidden message by ${message.author.username}`)
            }

			switch (message.content.split(" ")[0]) {
                /**
                 * Ping to check availability.
                 */
				case "§ping":
					message.reply("Pong!");
					break;

                /**
                 * Get a random number
                 */
				case "§random":
                case "§rand":
                    message.reply(Math.floor(Math.random() * 100));
                    break;

                /**
                 * Shake the 8ball for answers
                 */
                case "§8ball":
                    if (message.channel.name == "8ball")
                        message.reply(SillyFuncs.get8Ball())
                    break;

                case "§forbid":
                    if (message.channel.name == "bot-test" && message.author.id == super_admin_id) {
                        if (forbidden_user_ids.indexOf(message.content.split(" ")[1]) == -1) {
                            forbidden_user_ids.push(message.content.split(" ")[1])
                            message.channel.send(`User with ID "${message.content.split(" ")[1]}" is now ignored.`)
                        }
                        else {
                            message.channel.send(`User with ID "${message.content.split(" ")[1]}" is already ignored!`)
                        }
                    }
                    break;

                case "§allow":
                    if (message.channel.name == "bot-test" && message.author.id == super_admin_id) {
                        let index_of_forbidden = forbidden_user_ids.indexOf(message.content.split(" ")[1])
                        if (index_of_forbidden !== -1) {
                            forbidden_user_ids.splice(index_of_forbidden, 1)
                            message.channel.send(`User with ID "${message.content.split(" ")[1]}" is no longer ignored.`)
                        }
                        else {
                            message.channel.send(`User with ID "${message.content.split(" ")[1]}" is not ignored!`)
                        }
                    }
                    break;

                /**
                 * Debug old "markov" message
                 */
                case "§ms":
                    if (message.channel.name == "bot-test")
                    {
                        if (message.content.length > 3)
                            message.channel.send(MarkovChain.getRelatedMessage(message.content.substring(4)))
                        else
                            message.reply("`§ms <TEST SENTANCE>`")
                    }
                    break;

                /**
                 * Debug old markov message
                 */
                case "§markov":
                    if (message.channel.name == "bot-test")
                    {
                        if (message.content.length > 8) {
                            markov_message = MarkovChain.generateMarkovMessageV2(message.content.substring(8))
                            console.log(markov_message.split(" ").length)
                            
                            message.channel.send(markov_message + isValidMarkovMessage(markov_message, message.content.substring(8)).error_msg)
                        }
                        else
                            message.reply("`§markov <TEST SENTANCE>`")
                    }
                    break;

                /**
                 * No command
                 */
                default:
                    if (message.content.split(" ").length < 2 && (message.channel.name == "general" || message.channel.name == "video-gif-img-spam")) {
                        console.log(`[i] Message too short for markov.`);
                    }
                    else if (message.channel.name == "general" || message.channel.name == "video-gif-img-spam") {
                        let rand = Math.random();
                        if (!guarantee_hit) {
                            console.log(`[?] ${rand} < ${boundary}?`);
                        }
                        else {
                            console.log(`[?] Guaranteed hit?`);
                        }
                        if (guarantee_hit || (rand <= boundary && message.content.split(" ").length >= 2)) {
                            console.log(`[!] Yes!`);
                            console.log(`[i] Generating markov message (version 2)...\n`);
                            markov_message = MarkovChain.generateMarkovMessageV2(message.content);
                            let valid_check = isValidMarkovMessage(markov_message, message.content);

                            if (valid_check.is_valid) {
                                setTimeout(function(){message.channel.send(markov_message)}, 1500);
                                guarantee_hit = false;
                                boundary -= 0.25;
                                if (boundary < 0.0) {
                                    boundary = 0.0;
                                }
                            }
                            else {
                                console.log(`[!] Markov message did not pass: "${markov_message}" ${valid_check.error_msg}`);
                                guarantee_hit = true;
                                boundary += 0.005;
                            }
                        }
                        else {
                            console.log(`[!] No!`);
                            boundary += 0.015;
                        }
                    } else if (message.channel.name == "best-of-leastinhumanbot") {
                        if (message.content.length > 0) {
                            message.delete();
                            message.author.send("Only pictures are allowed in my hall of fame! :)");
                        }
                        else {
                            message.react('✅');
                            message.react('❌');
                        }
                    }
                    break;
			}
            let clean_message_content = "";
            let words_in_message_content = message.content.replace("§markov ", "").split(" ")
            if (words_in_message_content.length >= 3 && (message.channel.name == "general" || message.channel.name == "video-gif-img-spam")) {
                words_in_message_content.forEach(word => {
                    if ((word[0] != "<" && word[word.length - 1] != ">") && word[0] != "§" && word != "" && word != "" && word.indexOf("https://") == -1 && word.indexOf("http://") == -1)
                    clean_message_content += word + " "
                })
                clean_message_content = clean_message_content.substring(0, clean_message_content.length - 1)
                if (clean_message_content !== "" && clean_message_content.split(" ").length >= 3 && !isForbiddenMessage(clean_message_content) && !isForbiddenUser(message.author.id)) {
                    fs.appendFileSync("./dynamic_dict.txt", clean_message_content + "\r\n");
                    console.log(`[i] "${clean_message_content}" >> dynamic_dict.txt`)
                }
            }
		}
	} catch (ex) {
		console.log(ex);
	}
});


// Funcs
function isValidMarkovMessage(markov_message, user_message) {
    let error_msg = "";
    let is_valid = true;
    
    if (markov_message.split(" ").length <= 2
        || markov_message == user_message
        || user_message.indexOf(markov_message) != -1
    ) {
        is_valid = false;        
        error_msg = " (WOULD NOT BE SENT: "
        if (markov_message.split(" ").length <= 2) {
            error_msg += "**TOO_SHORT** "
        }
        if (markov_message == user_message) {
            error_msg += "**MATCHING** "
        }
        if (user_message.indexOf(markov_message) != -1) {
            error_msg += "**SUBSTRING** "
        }

        error_msg += ")"
    }

    return { is_valid, error_msg }
}


function isForbiddenUser(id) {
    if (forbidden_user_ids.includes(id)) {
        return true;
    }
    return false;
}


function isForbiddenMessage(message) {
    if (
        message.indexOf("https://tenor") != -1
        || message.indexOf("http://tenor") != -1
        || message.indexOf("https://media.discordapp.net/attachment") != -1
        || message.indexOf("http://media.discordapp.net/attachment") != -1
        || message.indexOf("https://cdn.discordapp.com/attachment") != -1
        || message.indexOf("http://cdn.discordapp.com/attachment") != -1
        || message.indexOf("https://media1.tenor.com/image") != -1
        || message.indexOf("http://media1.tenor.com/image") != -1
        || message.indexOf("https://tmp.projectlounge.pw") != -1
        || message.indexOf("http://tmp.projectlounge.pw") != -1
        || (message.indexOf("connect") != -1 && message.indexOf(";") != -1 && message.indexOf("password") != -1)
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