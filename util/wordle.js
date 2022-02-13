import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk'

/* Take in an input inputWord and returns a Godot bbcode_text formatted colored string to be sent back to Godot 

    @params `inputWord`: the word that was "killed" and being used to guess
            `hotWord`: the word that is the "wordle word" that the player needs to guess to win (spawner loses if this word is guessed)
    @return a string with color codes that is formatted for Godot

*/
export function formatGuess(inputWord, hotWord, letters) {
    // if (inputWord.includes("[center]")) {
    //     inputWord = inputWord.replace("[center]", "");
    //     inputWord = inputWord.replace("[/center]", "");
    // }
    let input = inputWord.toUpperCase();
    hotWord = hotWord.toUpperCase();

    let correctArr = ["", "", "", "", ""]; // correctArr is just the backend friendly array
    let discordArr = ["", "", "", "", ""]; // discordArr is the Discord friendly text that will be joined and returned
    let hotArry = hotWord.split('');
    let inputArr = input.split('');

    // Get all correct green letters
    for (let i = 0; i < hotArry.length; i++) {
        if (inputArr[i] === hotArry[i]) {
            correctArr[i] = chalk.green(hotWord.at(i));
            discordArr[i] = color(hotWord.at(i), "green");
            hotArry[i] = "";
            inputArr[i] = "";
            letters[hotWord.at(i)] = "[]";
        }
    }

    // Get all the yellow letters
    for (let i = 0; i < hotArry.length; i++) {
        // If the current spot is not correct, check to see if it's included in the hotArry
        if (correctArr[i] === "" && inputArr[i] !== "") {
            if (hotArry.includes(inputArr[i])) {
                correctArr[i] = chalk.yellow(inputArr[i]);
                discordArr[i] = color(inputArr[i], "yellow");
                hotArry[hotArry.indexOf(inputArr[i])] = "";
                if (letters[inputArr[i]] !== "[]") {
                    letters[inputArr[i]] = "()";
                }
            } else {
                correctArr[i] = chalk.red(inputArr[i]);
                discordArr[i] = color(inputArr[i], "red");
                if (letters[inputArr[i]] === "") {
                    letters[inputArr[i]] = "~";
                }
            }
        }
    }

    console.log("The player has guessed: ", correctArr.join(''));
    return {
        formatted: discordArr.join(''), letters: letters
    };
}

function color(letter, color) {
    if (color === "green") {
        return ` [${letter}] `;
    } else if (color === "yellow") {
        return ` (${letter}) `;
    } else {
        return ` ${letter} `
    }
}

export function formatHistory(history, guesses, total) {
    const formattedHistoryArray = history.map((guess) => { return makeEmojiRow(guess) });
    return `Discordle ${guesses}/${total}\n\n` + formattedHistoryArray.join("");
}

function makeEmojiRow(result) {
    const splitted = result.split(" ").filter((letter) => {
        if (letter != "") {
            return letter
        }
    });

    const emojis = splitted.map((letter) => {
        if (letter.includes("[")) {
            return ":green_square:";
        } else if (letter.includes("(")) {
            return ":yellow_square:";
        } else {
            return ":black_large_square:";
        }
    })
    return emojis.join("") + "\n";
}

export function greenEmojis(number) {
    let row = ""
    for (let i = 0; i < number; i++) {
        row += ":green_square:";
    }
    return row
}


/* Retrieve all words from the json file and returns an array of 5 letter capital letters strings
    @return array of strings that are all 5 letters long
*/

export function checkIfvalid(word, guessSet) {
    // const validWordList = retrieveValidWordList();
    // return validWordList.includes(word.toUpperCase());
    return guessSet.has(word);
}

export function retrieveValidWordList(jsonFile) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const fileName = __dirname + jsonFile;
    // guess list: https://gist.github.com/cfreshman/cdcdf777450c5b5301e439061d29694c
    // answer list: https://gist.github.com/cfreshman/a03ef2cba789d8cf00c08f767e0fad7b
    const allWords = JSON.parse(fs.readFileSync(fileName, { encoding: 'utf8' })); // JSONs are in utf16 LE
    return allWords.filter(word => word.length === 5 && /^[a-zA-Z]+$/.test(word)).map((word) => word.toUpperCase());
}

export function getGuessSet() {
    const wordList = retrieveValidWordList('/guesses.json');
    return new Set(wordList);
}

export function generateHotWord() {
    const validWordList = retrieveValidWordList('/answers.json');
    return validWordList[randomInt(0, validWordList.length)];
}

export function generateExtremeHotWord() {
    // 10,0000 possible words
    const validWordList = retrieveValidWordList('/guesses.json');
    return validWordList[randomInt(0, validWordList.length)];
}

export function randomInt(min, max) {
    // min and max inclusive
    return Math.floor(Math.random() * (max - min + 1) + min)
}

const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

export const makeLetterObject = () => {
    let letterObj = {}
    letters.forEach(letter => {
        letterObj[letter] = ""
    });
    return letterObj;
}