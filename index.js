const { getPercentage } = require("./utilities.js");
const { event, recorder, output, container } = codeceptjs;
const { IncomingWebhook } = require('@slack/webhook');

const helpers = container.helpers();
let helper;

const screenshotHelpers = [
  'WebDriver',
  'Protractor',
  'Appium',
  'Nightmare',
  'Puppeteer',
  'TestCafe',
  'Playwright',
];

for (const helperName of screenshotHelpers) {
  if (Object.keys(helpers).indexOf(helperName) > -1) {
    helper = helpers[helperName];
  }
}

const defaultConfig = {
  enabled: false,
  webhookUrl: process.env.SLACK_WEBHOOK_URL,
  messageIntro: "Acceptance Tests failed.",
  devMode: false
};

const requiredFields = ["webhookUrl"];

let totalScenarioCount = 0;
let passedScenarioCount = 0;
let failedScenarioCount = 0;

let failedScenarios = [];

module.exports = (config) => {
  config = Object.assign(defaultConfig, config);

  for (let field of requiredFields) {
    if (!config[field]) throw new Error(`Slack reporter config is invalid: "${field}" is missing in config.`)
  }

  event.dispatcher.on(event.test.before, (test) => {
    recorder.add(async () => {
      totalScenarioCount++;
    });
  });

  event.dispatcher.on(event.test.passed, (test) => {
    recorder.add(async () => {
      passedScenarioCount++;
    });
  });

  event.dispatcher.on(event.test.failed, async (test, err) => {
    recorder.add(async () => {
      failedScenarioCount++;
      failedScenarios.push({test, err});
    });
  });

  event.dispatcher.on(event.all.result, () => {

    let message = `${config.messageIntro}\n\n`;

    message += `Total scenarios executed: ${totalScenarioCount}\n`;
    message += `${passedScenarioCount} scenario/s passed (${getPercentage(passedScenarioCount, totalScenarioCount)})\n`;
    message += `${failedScenarioCount} scenario/s failed (${getPercentage(failedScenarioCount, totalScenarioCount)})\n\n`;
    for (let i = 0; i < failedScenarios.length; i++) {
      message += `*${failedScenarios[i].test.title}* failed because\n`;

      const shortenedErrorStack = failedScenarios[i].err.stack.replace(/\n\n\n\nRun with --verbose flag to see NodeJS stacktrace/, "");
      message += `\`\`\`${shortenedErrorStack}\`\`\`\n\n`;
    }

    // Only report in Slack if at least one scenario failed
    if ( !config.devMode && failedScenarioCount > 0 ) {

      const webhook = new IncomingWebhook(config.webhookUrl, {
        icon_emoji: ':bowtie:',
      });

      (async () => {
        await webhook.send({
          text: message,
        });
      })();
    }

    if ( config.devMode ) {
      output.print(message);
    }

  });

};
