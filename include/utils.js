import { readFile } from 'fs/promises';

async function fileReader(filepath, encoding = "utf8", split = false) {
    try {
        const data = await readFile(filepath, encoding);
        if (split) {
            return data.split(/\r?\n/);
        }
        return await readFile(filepath, encoding);
    } catch (error) {
        console.error("Error reading file:", error);
        throw error;
    }
}

async function loadHistory(filepath) {
        try {
            const data = await fileReader(filepath, "utf8");
            const history = JSON.parse(data);
            return history;
        } catch (error) {
            console.error('Error loading history:', error);
            return [];
        }
    }

export { fileReader, loadHistory };