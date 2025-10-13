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

function generateDailySet(history) {
    const mainLetterHistory = [...history.map(item => item.main)];
    const commonLetters = 'etaoinshrdlcumwfgypbvkjxqz';
    const arraySet = [];
    
    // Generate 8 unique letters
    while (arraySet.length < 8) {
        const char = commonLetters[Math.floor(Math.random() * commonLetters.length)];
        // make sure the last chat is not in the main letter history
        if (mainLetterHistory.includes(char)) {
            continue;
        }
        if (!arraySet.includes(char)) {
            arraySet.push(char);
        }
    }
    
    // Choose main letter from the set
    const mainLetter = arraySet.pop();
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
    const dailySet = generateDailySet(history);
    
    fs.writeFileSync('./api/daily-set.json', JSON.stringify(dailySet, null, 2));
    
    const updatedHistory = [dailySet, ...history];
    if(updatedHistory.length > 7) {
        updatedHistory.pop();
    }
    
    fs.writeFileSync('./api/history.json', JSON.stringify(updatedHistory, null, 2));
    console.log('Files updated successfully!');
}

main().catch(console.error);