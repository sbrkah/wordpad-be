const fs = require('fs');

async function loadHistory() {
    try {
        const data = await fs.promises.readFile('./api/history.json', 'utf8');
        const history = JSON.parse(data);
        return history;
    } catch (error) {
        console.error('Error loading history:', error);
        return [];
    }
}

async function generateDailySet(history) {
    const mainLetterHistory = [...history.map(item => item.main)];
    const commonLetters = 'etaoinshrdlcumwfgypbvkjxqz';
    const corelation = JSON.parse(await fs.promises.readFile('./corelation.json', 'utf8'));
    const arraySet = [];
    let mainLetter = '';

    while (1){
        mainLetter = commonLetters[Math.floor(Math.random() * commonLetters.length)];
        if (!mainLetterHistory.includes(mainLetter)) {
            break;
        }
    }
    // Generate 8 unique letters
    while (arraySet.length < 7) {
        const char = commonLetters[Math.floor(Math.random() * commonLetters.length)];
        // make sure the last chat is not in the main letter history
        if (!arraySet.includes(char) && char !== mainLetter && corelation[`${mainLetter}${char}`] > 0) {
            arraySet.push(char);
        }
    }
    
    const builderLetter = arraySet.join('');
    
    return { 
        builderLetter, 
        mainLetter, 
        date: new Date().toISOString().split('T')[0] 
    };
}

// Main execution
async function main() {
    const history = await loadHistory();
    const dailySet = await generateDailySet(history);
    
    fs.writeFileSync('./api/daily-set.json', JSON.stringify(dailySet, null, 2));
    
    const updatedHistory = [dailySet, ...history];
    if(updatedHistory.length > 7) {
        updatedHistory.pop();
    }
    
    fs.writeFileSync('./api/history.json', JSON.stringify(updatedHistory, null, 2));
    console.log('Files updated successfully!');
}

main().catch(console.error);