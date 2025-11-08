import { writeFileSync } from 'fs';
import { fileReader, loadHistory } from './utils.js';
import { console } from 'inspector';

let crntry = 0;
let maxtry = 2800;

class Generate {
    static l = 'xqvz'.split('');        // Least common letter
    static t = 'ageinrou'.split('');    // Most common letter in KBBI
    static alphabet = 'etaoinshrdlcumwfgypbvkjxqz'.split('');
    static r = this.alphabet.filter(char => !this.t.includes(char) && !this.l.includes(char));

    static ml = '';
    static bl = '';
    static wordLib = [];
    static history = [];
    static possibleSet = new Set(this.wordLib.join(''));

    static updatePossibleSet(){
        let key = new Set(this.ml + this.bl);
        function strHasAll(str){
            let set = new Set(str);
            set.forEach(char => {if(!key.has(char))return false});
            return true;
        }

        this.wordLib = this.wordLib.filter(item => strHasAll(item));
        this.possibleSet = new Set(this.wordLib.join(''));
    }

    static #getDict(){
        return {
            builderLetter: this.bl,
            mainLetter: this.ml,
            date: new Date().toISOString().split('T')[0]
        }
    }

    static async Run() {
        this.history = await loadHistory("./api/history.json");
        this.wordLib = await fileReader("./corelation/xxx.txt", "utf8", "\n");
        const mlhistory = [...this.history.map(item => item.main)];
        
        while(true) {
            this.ml = this.alphabet[Math.floor(Math.random() * this.alphabet.length)];
            if(!mlhistory.includes(this.ml)) {
                this.updatePossibleSet(); break;
            }
        }

        while(this.bl.length < 6 && crntry < maxtry) {
            while (crntry < maxtry){
                const char = this.alphabet[Math.floor(Math.random() * this.alphabet.length)];
                if (this.ml !== char && !this.bl.includes(char) && this.possibleSet.has(char)) {
                    this.bl += char; break;
                }

                crntry++;
            }

            this.updatePossibleSet();
        }

        return this.#getDict();
    }

    static saveDailySet(){
        const dailySet = this.#getDict();
        let updatedHistory = [dailySet, ...this.history];
        writeFileSync('./api/daily-set.json', JSON.stringify(dailySet, null, 2));

        if(updatedHistory.length > 7) {
            updatedHistory = updatedHistory.slice(0, 7);
        }
        
        writeFileSync('./api/history.json', JSON.stringify(updatedHistory, null, 2));
        console.log('Daily set updated successfully!', dailySet);
    }
}

async function main() {
    const dailySet = await Generate.Run();
    Generate.saveDailySet();
}

main().catch(console.error);