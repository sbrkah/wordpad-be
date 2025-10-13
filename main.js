const fs = require('fs');

function generateDailySet() {
    const commonLetters = 'etaoinshrdlcumwfgypbvkjxqz';
    const set = Array.from({ length: 8 }, () =>
        commonLetters[Math.floor(Math.random() * commonLetters.length)]
    )
    const main = set.pop();
    set = set.join('');

    return { set, main, date: new Date().toISOString().split('T')[0] };
}

const dailySet = generateDailySet();
fs.writeFileSync('./api/daily-set.json', JSON.stringify(dailySet, null, 2));