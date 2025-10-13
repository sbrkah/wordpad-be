const fs = require('fs');

function generateDailySet() {
    const commonLetters = 'etaoinshrdlcumwfgypbvkjxqz';
    const arraySet = Array.from({ length: 8 }, () =>
        commonLetters[Math.floor(Math.random() * commonLetters.length)]
    )
    const main = arraySet.pop();
    const charset = arraySet.join('');

    return { charset, main, date: new Date().toISOString().split('T')[0] };
}

const dailySet = generateDailySet();
fs.writeFileSync('./api/daily-set.json', JSON.stringify(dailySet, null, 2));