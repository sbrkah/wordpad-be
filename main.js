import { writeFileSync } from "fs";
import { fileReader, loadHistory } from "./utils.js";

class Generate {
    // Configuration
    static #maxAttempts = 248;
    static #desiredLength = 7;
    static #minimumCount = 100;
    // Letter categories - fixed definitions
    static VOWELS = "aiueo".split(""); // V: Vocal
    static TOP = "ageinou".split(""); // T: Top most common
    static LEAST = "xqvz".split(""); // L: Least common
    static alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
    static REGULAR = this.alphabet;

    // Available formations as string array
    static FORMATIONS = [
        'VVVRRRR',
        'VVRRRRT',
        'VVVRRRT',
        'VVRRRTT',
        'VVVVRRR',
        'VRRRRTT',
    ];

    static ml = "";
    static bl = [];
    static wordLib = [];
    static history = [];
    static #contaminated = false;
    static #possibleSet = new Set();
    static #currentFormation = null;

    static Configure(_desiredLength = 7, _maxAttempts = 248, _minimumCount = 100) {
        this.#desiredLength = _desiredLength;
        this.#maxAttempts = _maxAttempts;
        this.#minimumCount = _minimumCount;
    }

    // Initialize with full word library
    static async #initializeWordLib() {
        this.wordLib = await fileReader("./corelation/xxx.txt", "utf8", "\n");
        const allLetters = new Set(this.wordLib.join(""));
        this.#possibleSet = allLetters;
        this.#regularApplyNormal();
        this.bl = [];
        this.ml = "";
    }

    static #regularApplyStrict() {
        this.REGULAR = this.alphabet.filter(char => !this.LEAST.includes(char));
        this.#contaminated = true;
    }
    static #regularApplyNormal() {
        this.REGULAR = this.alphabet;
        this.#contaminated = false;
    }

    // Filter words that could be formed with current letters
    static #updatePossibleSet() {
        if (this.#mlbl().length === 0) return;

        this.wordLib = this.wordLib.filter((word) => {
            if (!word.includes(this.ml)) return false;
            if (new Set(word + this.#mlbl()).size > this.#desiredLength) return false;
            return true;
        });

        this.#possibleSet = new Set(this.wordLib.join(""));
    }

    static #mlbl() {
        return this.ml + this.bl.join("");
    }

    static #getDict() {
        return {
            builderLetter: this.bl.join(""),
            mainLetter: this.ml,
            date: new Date().toISOString().split("T")[0],
        };
    }

    // Get yesterday's main letter only
    static #getYesterdayMainLetter() {
        if (this.history.length === 0) return null;
        const yesterday = this.history[0];
        return yesterday.mainLetter;
    }

    // Select a random formation
    static #selectFormation() {
        return this.FORMATIONS[Math.floor(Math.random() * this.FORMATIONS.length)];
    }

    // Get pool for category without filtering by #possibleSet initially
    static #getCategoryPool(category) {
        switch (category) {
            case "V": return this.VOWELS;
            case "T": return this.TOP;
            case "L": return this.LEAST;
            case "R": return this.REGULAR;
            case "P": return this.REGULAR;
            default: return this.REGULAR;
        }
    }

    static #getAvailablePool(category, position, currentLetters, avoidLetters = new Set()) {
        let pool = this.#getCategoryPool(category);
        // Apply special rules
        if (category === "R" && !this.#contaminated && this.LEAST.includes(currentLetters[position - 1])) this.#regularApplyStrict();
        return pool.filter((char) => !avoidLetters.has(char) && this.#possibleSet.has(char) && !currentLetters.includes(char));
    }

    static #generateByFormation(formationString, avoidMainLetter) {
        const result = { ml: "", bl: [] };
        const allLetters = [];
        const avoidLetters = avoidMainLetter
            ? new Set([avoidMainLetter])
            : new Set();

        // Main loop iteration is here
        for (let i = 0; i < formationString.length; i++) {
            const category = formationString[i];
            const pool = this.#getAvailablePool(category, i, allLetters.join(''), i === 0 ? avoidLetters : new Set(allLetters));

            if (pool.length === 0) throw new Error(`No available letters for category ${category} at position ${i}`);

            const letter = pool[Math.floor(Math.random() * pool.length)];

            if (i === 0) {
                this.ml = letter;
            } else {
                this.bl.push(letter);
            }
            allLetters.push(letter);
            this.#updatePossibleSet();
        }

        return result;
    }

    static async Run() {
        await this.#initializeWordLib();
        this.history = await loadHistory("./api/history.json");

        const avoidMainLetter = this.#getYesterdayMainLetter();
        let success = false;
        let attempts = 0;

        while (!success && attempts < this.#maxAttempts) {
            try {
                // Select random formation
                this.#currentFormation = this.#selectFormation();
                console.log(`Attempt ${attempts + 1}: Using formation ${this.#currentFormation}`);

                this.#generateByFormation(this.#currentFormation, avoidMainLetter);

                // Validate we have enough possible words
                if (this.wordLib.length >= this.#minimumCount && new Set(this.#mlbl()).size === this.#desiredLength) {
                    success = true;
                    console.log(`Success! Generated set: ${this.#mlbl()} with ${this.wordLib.length} possible words`);
                } else {
                    console.log(`Set ${this.#mlbl()} has only ${this.wordLib.length} words, retrying...`);
                    await this.#initializeWordLib();
                }
            } catch (error) {
                console.log(`Attempt ${attempts + 1} failed: ${error.message}`);
                await this.#initializeWordLib();
            }

            attempts++;
        }

        if (!success) {
            throw new Error(
                `Failed to generate valid letter set after ${this.#maxAttempts} attempts`,
            );
        }

        return this.#getDict();
    }

    static saveDailySet() {
        const dailySet = this.#getDict();
        let updatedHistory = [dailySet, ...this.history];
        writeFileSync("./api/daily-set.json", JSON.stringify(dailySet, null, 2));

        if (updatedHistory.length > 7) {
            updatedHistory = updatedHistory.slice(0, 7);
        }

        writeFileSync(
            "./api/history.json",
            JSON.stringify(updatedHistory, null, 2),
        );
        console.log("Daily set updated successfully!", dailySet);
    }
}

export default Generate;

async function main() {
    await Generate.Run();
    Generate.saveDailySet();
}

main().catch(console.error);