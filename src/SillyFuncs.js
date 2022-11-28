const ballquotes = [
    "don't count on it.",
    "as I see it, yes.",
    "it is certain.",
    "reply hazy, try again.",
    "my reply is no.",
    "most likely.",
    "it is decidedly so.",
    "ask again later.",
    "my sources say no.",
    "outlook good.",
    "without a doubt.",
    "better not tell you now.",
    "yes - definitely.",
    "cannot predict now.", 
    "you may rely on it.",
    "concentrate and ask again.",
    "outlook not so good.",
    "signs point to yes.",
    "very doubtful.",
    "yes."
];

function get8Ball() {
    return ballquotes[Math.floor(Math.random() * (ballquotes.length + 1))];
}

module.exports = {
    get8Ball
}