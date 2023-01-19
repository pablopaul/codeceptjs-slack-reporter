const { output } = require('codeceptjs');
const fs = require('fs').promises;
const path = require("path");
const axios = require('axios');

async function isGitlabMrWorkInProgress(gitlabProjectId, mrIdEnvVarName) {

    if(!mrIdEnvVarName) {
        return false;
    }

    const gitlabApiPath = 'https://gitlab.com/api/v4';
    try {
        const response = await axios.get(`${gitlabApiPath}/projects/${gitlabProjectId}/merge_requests/${mrIdEnvVarName}?private_token=${process.env.GL_TOKEN}`);
        return response.data.work_in_progress;
    }
    catch (err) {
        output.print(`Error while calling the GitLab MR API: ${JSON.stringify(err)}`);

        return false;
    }
}

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

    async function indicateWorkInProgressStatus(threadId) {
        try {
            // Call the chat.postMessage method using the built-in WebClient
            const result = await app.client.reactions.add({
                // The token you used to initialize your app
                token: pluginConfig.token,
                channel: pluginConfig.channelId,
                timestamp: threadId,
                name: "construction"
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
    firstMessage += `\`\`\`\n${JSON.stringify(err)}\n\`\`\`\n\n`;

    let followUpMessage = `*${oneLineTitle}* failed because\n`;
    followUpMessage += `\`\`\`\n${JSON.stringify(err)}\n\`\`\`\n\n`;

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

        if (pluginConfig.gitlabIndicateDraftStatus && await isGitlabMrWorkInProgress(pluginConfig.gitlabProjectId, pluginConfig.gitlabMrIdEnvVarName)) {
            await indicateWorkInProgressStatus(threadId);
        }
    }
}

module.exports = { notifySlackChannel };
