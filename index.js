const { getPercentage } = require("./utilities.js");
const { event, recorder, output, container } = codeceptjs;

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
  projectName: '',
  debug: false,
  enabled: false
};

const requiredFields = [];

let totalScenarioCount = 0;
let passedScenarioCount = 0;
let failedScenarioCount = 0;

let failedScenarios = [];

module.exports = (config) => {
  config = Object.assign(defaultConfig, config);

  for (let field of requiredFields) {
    if (!config[field]) throw new Error(`Slack reporter config is invalid. Key ${field} is missing in config.\nRequired fields: ${requiredFields} `)
  }

  event.dispatcher.on(event.test.failed, async (test, err) => {
    recorder.add(async () => {
      failedScenarioCount++;
      failedScenarios.push({test, err});
    });
  });

  event.dispatcher.on(event.all.result, () => {
    output.print(`Total scenarios executed: ${totalScenarioCount}`);
    output.print(`${passedScenarioCount} scenario/s passed (${getPercentage(passedScenarioCount, totalScenarioCount)})`);
    output.print(`${failedScenarioCount} scenario/s failed (${getPercentage(failedScenarioCount, totalScenarioCount)})`);
    output.print("\n");
    for (let i = 0; i < failedScenarios.length; i++) {
      const shortenedErrorStack = failedScenarios[i].err.stack.replace(/\n\n\n\nRun with --verbose flag to see NodeJS stacktrace/, "");
      output.print(`"${failedScenarios[i].test.title}" failed because`);
      output.print(shortenedErrorStack);
      output.print("\n---\n");
    }
  });

};
