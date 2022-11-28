const fs = require("fs");

function generateMarkovMessageV2(user_message, key_size = 2) {
    let markov_message = "";

    let dict_lines = fs.readFileSync("./dynamic_dict.txt").toString().split("\r\n");
    dict_lines = dict_lines.slice(0, dict_lines.length)

    //console.log(dict_lines)

    prefix_suffix_map = {};
    dict_lines.forEach(line => {
        let words_in_line = line.split(" ")
        //console.log("New line: \"" + words_in_line + "\"")
        for (i = 0; i < words_in_line.length - 1; i++) {
            key = "";
            for (j = 0; j < key_size; j++) {
                key += words_in_line[i + j].trim() + " "
                key = key.toLowerCase();
            }

            if (i + key_size < words_in_line.length)
                value = words_in_line[i + key_size].trim() + " ";
            else
                value = ""

            if (prefix_suffix_map[key] === undefined) {
                prefix_suffix_map[key] = [value]
            }
            else if (prefix_suffix_map[key].includes(value)) {
                continue;
            }
            else {
                prefix_suffix_map[key] = prefix_suffix_map[key].concat([value])
            }
        }
    })

    //console.log(prefix_suffix_map)

    n = 0;
    rn = Math.floor(Math.random() * Object.keys(prefix_suffix_map).length);
    while (user_message.indexOf("<@886995935324946452>") != -1)
        user_message = user_message.replace("<@886995935324946452>", "");
    user_message_words = user_message.toLowerCase().split(" ");
    user_message_words_orig = user_message.split(" ");
    prefixStartInd = Math.floor(Math.random() * (user_message.split(" ").length - 1));
    prefix = user_message_words[prefixStartInd] + " " + user_message_words[prefixStartInd + 1] + " ";
    markov_message += user_message_words_orig[prefixStartInd] + " " + user_message_words_orig[prefixStartInd + 1] + " ";

    while (true) {
        let suffixList = prefix_suffix_map[prefix];
        console.log(prefix, suffixList)
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
        prefix = prefix.toLowerCase()
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

module.exports = {
    generateMarkovMessageV2,
    getRelatedMessage
}
