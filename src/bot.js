require("dotenv").config();

const fs = require("fs");
const { Client } = require("discord.js");
const { count, Console } = require("console");

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
            console.log("Channel: \"" + message.channel.name + "\" Content: \"" + message.content + "\" (" + message.content.length + ")")
            let clean_message_content = "";
            let words_in_message_content = message.content.replace("§markov ", "").split(" ")
            if (words_in_message_content.length >= 2 && message.channel.name == "general") {
                words_in_message_content.forEach(word => {
                    if ((word[0] != "<" && word[word.length - 1] != ">") && word[0] != "§" && word != "")
                    clean_message_content += word + " "
                })
                clean_message_content = clean_message_content.substring(0, clean_message_content.length - 1)
                if (clean_message_content !== "")
                fs.appendFileSync("./dynamic_dict.txt", clean_message_content + "\r\n");
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
                        message.reply(get8Ball())
                    break;
                case "§ms":
                    if (message.channel.name == "bot-test")
                    {
                        if (message.content.length > 3)
                            //message.reply(getMarkovMessage(message.content.substring(4)))
                            message.channel.send(getRelatedMessage(message.content.substring(4)))
                        else
                            message.reply("`§ms <TEST SENTANCE>`")
                    }
                    break;
                case "§markov":
                    if (message.channel.name == "bot-test")
                    {
                        if (message.content.length > 8) {
                            markov_message = generateMarkovMessageV2(message.content.substring(8))
                            console.log(markov_message.split(" ").length)
                            if (markov_message.split(" ").length <= 2)
                                markov_message += " (too short to be sent!)"
                            message.channel.send(markov_message)
                        }
                        else
                            message.reply("`§markov <TEST SENTANCE>`")
                    }
                    break;
                default:
                    if (message.channel.name == "general") {
                        let rand = Math.random();
                        console.log("Rolled (boundary): ", rand, "("+boundary+")");
                        if (rand <= boundary && message.content.split(" ").length >= 2) {
                            if (boundary < 0.01)
                                boundary = 0.0

                                markov_message = generateMarkovMessageV2(message.content)

                            if (markov_message.split(" ").length > 2)
                                setTimeout(function(){message.channel.send(markov_message)}, 1000)
                                boundary -= 0.25;
                        }
                        else {
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

function get8Ball() {
    return ballquotes[Math.floor(Math.random() * (ballquotes.length + 1))];
}

function generateMarkovMessageV2(user_message, key_size = 2) {
    console.log("\nGenerating markov message (version 2)...\n");
    let markov_message = "";

    let dict_lines = fs.readFileSync("./dynamic_dict.txt").toString().split("\r\n");
    dict_lines = dict_lines.slice(0, dict_lines.length)

    console.log(dict_lines)

    prefix_suffix_map = {};
    dict_lines.forEach(line => {
        let words_in_line = line.split(" ")
        //console.log("New line: \"" + words_in_line + "\"")
        for (i = 0; i < words_in_line.length - 2; i++) {
            key = "";
            for (j = 0; j < key_size; j++) {
                if (words_in_line[i + j] == "")
                    continue;
                key += words_in_line[i + j].trim() + " ";
            }

            //console.log("key: \"" + key + "\"")
            
            if (i + key_size < words_in_line.length)
                value = words_in_line[i + key_size].trim() + " ";
            else
                value = ""

            //console.log("value: \"" + value + "\"")
            
            if (prefix_suffix_map[key] === undefined) 
                prefix_suffix_map[key] = [value]
            else if (prefix_suffix_map[key].includes(value))
                continue;
            else 
                prefix_suffix_map[key] = prefix_suffix_map[key].concat([value])
        }
    })

    console.log(prefix_suffix_map)

    n = 0;
    rn = Math.floor(Math.random() * Object.keys(prefix_suffix_map).length);
    while (user_message.indexOf("<@886995935324946452>") != -1)
        user_message = user_message.replace("<@886995935324946452>", "");
    user_message_words = user_message.split(" ");
    prefixStartInd = Math.floor(Math.random() * (user_message.split(" ").length - 1));
    prefix = user_message_words[prefixStartInd] + " " + user_message_words[prefixStartInd + 1] + " ";
    markov_message += prefix;

    while (true) {
        let suffixList = prefix_suffix_map[prefix];
        console.log("Prefix: '" + prefix + "'")
        console.log("suffixList: '" + suffixList + "'")
        //console.log("markov_message: " + markov_message)

        // Key (prefix) does not exist, so no value (suffix) available
        if (suffixList !== undefined) {
            // If only one suffix possible
            if (suffixList.length === 1) {
                if (suffixList[0] == "")
                    markov_message += " ";
                else
                    markov_message += suffixList[0] + " ";
            } else {
                rn = Math.floor(Math.random() * suffixList.length);
                markov_message += suffixList[rn] + " ";
            }
        } else {
            return markov_message.substring(0, markov_message.length - 1)
        }

        n += 1;
        prefix = markov_message.split(" ")[n] + " " + markov_message.split(" ")[n + 1] + " "; // Holy shit this is so lazy ???
        markov_message = markov_message.replace("  ", " ");
    }
}

// Current prefix size is set to 2
function generateMarkovMessage(userMessage, keySize = 2) {
    console.log("\nGenerating markov message...");
    let markovMessage = "";

    // Should be moved to only do once, no need to do it more than once after startup
    prefix_suffix_map = {};
    for (i = 0; i < pure_dictionary_words.length - 2; i++) {
        key = "";
        for (j = 0; j < keySize; j++) {
            if (pure_dictionary_words[i + j] == "")
              continue;
            key += pure_dictionary_words[i + j].replace(/\n|\r/g, " ").trim() + " ";
        } 

        if (i + keySize < pure_dictionary_words.length)
            value = pure_dictionary_words[i + keySize].trim();
        else
            value = ""

        if (prefix_suffix_map[key] === undefined) 
            prefix_suffix_map[key] = [value]
        else if (prefix_suffix_map[key].includes(value))
            continue;
        else 
            prefix_suffix_map[key] = prefix_suffix_map[key].concat([value])
    }

    console.log(prefix_suffix_map)

    n = 0;
    rn = Math.floor(Math.random() * Object.keys(prefix_suffix_map).length);
    while (userMessage.indexOf("<@886995935324946452>") != -1)
        userMessage = userMessage.replace("<@886995935324946452>", "");
    userMessageWords = userMessage.split(" ");
    prefixStartInd = Math.floor(Math.random() * (userMessage.split(" ").length - 1));
    prefix = userMessageWords[prefixStartInd] + " " + userMessageWords[prefixStartInd + 1] + " ";
    markovMessage += prefix;

    while (true) {
        let suffixList = prefix_suffix_map[prefix];

        // Key (prefix) does not exist, so no value (suffix) available
        if (suffixList !== undefined) {
            // If only one suffix possible
            if (suffixList.length === 1) {
                if (suffixList[0] == "")
                    markovMessage += " ";
                else
                    markovMessage += suffixList[0] + " ";
            } else {
                rn = Math.floor(Math.random() * suffixList.length);
                markovMessage += suffixList[rn] + " ";
            }
        
            if (markovMessage.length >= userMessage.length * 2) {
                return markovMessage;
            }
        }

        if (n + 1 >= markovMessage.split(" ").length) {
            return markovMessage;
        }

        n += 1;
        prefix = markovMessage.split(" ")[n] + " " + markovMessage.split(" ")[n + 1]; // Holy shit this is so lazy ???
        markovMessage = markovMessage.replace("  ", " ");
    }
}

// Old function to get a "related message"
function getRelatedMessage(userMessage) {
    console.log("\nGetting related message...\n");
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
            if (wordSplit.length > 1 && wordSplit[0].startsWith("<") && wordSplit[2].endsWith(">"))
                word = wordSplit[1]

            if (line.includes(word))
                relationQuota += relationQuotaInc;
        });

        
        if (relationQuota < 0.1 && failedFindings < 50000) {
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

        if (Math.random() <= 0.25 && (markovsentance != undefined && markovsentance != NaN && markovsentance != "" & markovsentance != " " && markovsentance.length != 0))
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