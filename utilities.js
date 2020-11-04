const fs = require('fs').promises;
const path = require("path");

async function notifySlackChannel(app, pluginConfig, test, err) {

    // Post a message to a channel your app is in using ID and message text
    async function publishMessage(text, threadId) {
        try {
            // Call the chat.postMessage method using the built-in WebClient
            const result = await app.client.chat.postMessage({
                // The token you used to initialize your app
                token: pluginConfig.token,
                channel: pluginConfig.channelId,
                thread_ts: threadId,
                text
            });

            return result;
        }
        catch (error) {
            console.error(error);
        }
    }

    const fileName = `${pluginConfig.threadFilename}.txt`;
    const absoluteOutputPath = path.resolve(__dirname, output_dir);
    const filePath = path.join(absoluteOutputPath, fileName);

    // Make sure output dir exists
    try {
        await fs.statSync(absoluteOutputPath);
    } catch (err) {
        if (err.code === "ENOENT")
            try {
                await fs.mkdirSync(absoluteOutputPath, { recursive: true });
            } catch (err) {
                throw err;
            }
    }

    // Prep first message

    let firstMessage = `${pluginConfig.messageIntro}\n\n`;

    const oneLineTitle = test.title.replace(/\s\s\s\s\s\s/, "").replace(/\n\s\s\s\s\s\s\s\s\s/, "");
    firstMessage += `*${oneLineTitle}* failed because\n`;
    firstMessage += `\`\`\`\n${err.message}\n\`\`\`\n\n`;

    let followUpMessage = `*${oneLineTitle}* failed because\n`;
    followUpMessage += `\`\`\`\n${err.message}\n\`\`\`\n\n`;

    /*
     The first failed scenario for the current branch creates a message thread and
     saves it to a file, following failures will be posted into this thread

     Basically this is a workaround to enable the workers to communicate with each other
     */

    try {
        // Branch specific thread file exists, not first failure

        await fs.stat(filePath);
        let threadId = await fs.readFile(filePath);
        threadId = threadId.toString();
        await publishMessage(followUpMessage, threadId);

    } catch (err) {
        // Branch specific thread file does not exists, first failure

        const response = await publishMessage(firstMessage);
        const threadId = response.ts;

        await fs.writeFile(
            filePath,
            `${threadId}`,
            err => {
                if (err) throw err;
            }
        );
    }
}

module.exports = { notifySlackChannel };