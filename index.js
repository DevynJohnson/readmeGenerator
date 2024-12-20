import { writeFile, mkdir } from 'fs/promises'; // Import built-in Node.js write file and create directory functions using fs/promises
import inquirer from 'inquirer'; // Import inquirer for prompting user questions from npm package
import path from 'path'; // Import path for joining file paths from built-in Node.js module

// Declare variables
const answers = {}; // Object to store user answers to prompts
const collaborators = []; // Define an array to hold objects with collaborator information
const thirdPartyAnswers = [] // Define an array to hold objects with third-party asset information
const licenseArray = [ // Array of license options with name, link, and badge information
    { name: 'MIT', link: 'https://opensource.org/licenses/MIT', badge: '[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)' },
    { name: 'GNU GPLv3', link: 'https://www.gnu.org/licenses/gpl-3.0.html', badge: '[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)' },
    { name: 'Apache 2.0', link: 'https://www.apache.org/licenses/LICENSE-2.0', badge: '[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)' },
    { name: 'ISC', link: 'https://opensource.org/licenses/ISC', badge: '[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)' },
    { name: 'Unlicensed', link: 'https://choosealicense.com/no-permission/', badge: '[![License: Unlicense](https://img.shields.io/badge/license-Unlicense-blue.svg)](http://unlicense.org/)' },
    { name: 'Other', link: '', badge: '' },
];
const licenseInfo = {}; // Object to store license information

const questions = [ // Array of questions to prompt user for input
    {
        type: 'input', // Type of question is input allowing user to input text
        message: 'What is the title of your project?', // Question prompt
        name: 'title', // Name of the key in the answers object
    },
    {
        type: 'input',
        message: 'Please provide a description of your project. Keep in mind what motivted you to create it, and explain what problem it solves.',
        name: 'description',
    },
    {
        type: 'input',
        message: 'Please provide step-by-step installation instructions for your project.',
        name: 'installation',
    },
    {
        type: 'input',
        message: 'Please provide usage information for your project, such as instructions and examples for use.',
        name: 'usage',
    },
    {
        type: 'input',
        message: 'What is your name?',
        name: 'selfCreditName',
    },
    {
        type: 'input',
        message: 'Please provide the full URL link to your GitHub profile.',
        name: 'selfGithub',
    },
];

// Define functions

async function askCollaborator() { // Function to determine if there are any collaborators on the project
    const { collaborators: hasCollaborators } = await inquirer.prompt([ // Prompt user to answer yes or no to having collaborators}
        {
            type: 'confirm', // Confirm question type prompts user to answer yes or no
            message: 'Did you have any collaborators on this project?',
            name: 'collaborators',
        }
    ]);

        if (hasCollaborators) { // If user answers yes to having collaborators, run askCollaborator function
            await collectCollaboratorInfo(); // If user answers yes to having collaborators, run collectCollaboratorInfo function to collect collaborator information
        } else { 
            await askThirdPartyAssets(); // If user answers no, run askThirdPartyAssets function defined below to continue with prompts
    };
};

       async function collectCollaboratorInfo() { // Function to collect collaborator information
        const collaboratorAnswers = await inquirer.prompt([ // Prompt user for collaborator information    
        {
            type: 'input',
            message: 'What is the name of this collaborater to your project?',
            name: 'otherName',
        },
        {
            type: 'input',
            message: 'Please add the complete URL link to their GitHub profile.',
            name: 'otherGithub',
        },
        {
            type: 'confirm',
            message: 'Do you have more collaborators to add?',
            name: 'addAnotherCollaborator',
        },
    ]);

    collaborators.push({ // Push collaborator object to collaborators array
        name: collaboratorAnswers.otherName,
        link: collaboratorAnswers.otherGithub,
    });
    
    if (collaboratorAnswers.addAnotherCollaborator) { // If user answers yes to adding another collaborator, run function again
        await collectCollaboratorInfo();
    } else { // If user answers no, run askThirdPartyAssets function defined below to continue with prompts
        await askThirdPartyAssets();
    }
};

async function askThirdPartyAssets() { // Function to determine if any third party assets were used in the creation of the project
    const { thirdPartyAssets } = await inquirer.prompt([ // Prompt user to answer yes or no to using third-party assets
        {
            type: 'confirm',
            message: 'Did you use any third-party assets for this project, for example: npm packages or online tutorials?',
            name: 'thirdPartyAssets',
        }
    ]);
    
        if (thirdPartyAssets) { // If user answers yes to using third-party assets, run askThirdPartyLink function to collect asset information
            await collectThirdPartyInfo();
        } else { // If user answers no, run askLicense function defined below to continue with prompts
            await askLicense();
        }
};
async function collectThirdPartyInfo() { // Function to collect third-party asset links
    const thirdPartyInfoAnswers = await inquirer.prompt([
        {
            type: 'input',
            message: 'Provide the name of the third-party asset.',
            name: 'thirdPartyName',
        },
        {
            type: 'input',
            message: 'Provide a link to the web presence of the asset.',
            name: 'thirdPartyLink',
        },
        {
            type: 'confirm',
            message: 'Do you have more third-party assets to add?',
            name: 'addAnotherThirdParty',
        }
    ]);

    thirdPartyAnswers.push({ // Push third-party asset object to thirdPartyAnswers array
        name: thirdPartyInfoAnswers.thirdPartyName,
        link: thirdPartyInfoAnswers.thirdPartyLink,
    });

        if (thirdPartyInfoAnswers.addAnotherThirdParty) { // If user answers yes to adding another third-party asset, run function again
            await collectThirdPartyInfo();
        } else { // If user answers no, run askLicense function defined below to continue with prompts
            await askLicense();
        }
    };

async function askLicense() { // Function to prompt user for license information
    const { license } = await inquirer.prompt([
        {
            type: 'list', // List question type prompts user to select an option from a provided list
            message: 'Which license are you using?',
            choices: ['MIT', 'GNU GPLv3', 'Apache 2.0', 'ISC', 'Other', 'Unlicensed'],
            name: 'license',
        }
    ]);

        if (license === 'Other') { // If user selects 'Other' as license option, prompt user for custom license information
            const otherLicenseInfo = await inquirer.prompt([ 
                {
                    type: 'input',
                    message: 'Provide the name of the license.',
                    name: 'licenseName',
                },
                {
                    type: 'input',
                    message: 'Provide the full URL link to the license information.',
                    name: 'licenseLink',
                },
            ]);
            Object.assign(licenseInfo, { name: otherLicenseInfo.licenseName, link: otherLicenseInfo.licenseLink, badge: '', type: 'Other' }); // Assign the user-provided license information to the licenseInfo object
        } else {
            const selectedLicense = licenseArray.find((item) => item.name === license); // Find the selected license from the licenseArray
           Object.assign(licenseInfo, selectedLicense); // Assign the selected license to the licenseInfo object
        }
            generateReadme(); // Call generateReadme function after all information is collected
        };
function generateReadme() { // Function to generate README.md file

    // Below is the template literal for the README.md file that will be generated
    const readmeContent = `
# ${answers.title} ${licenseInfo.badge}
            
## Description
<p>${answers.description}</p>
            
## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Credits](#credits)
- [Questions](#questions)
- [License](#license)
            
## Installation
<p>${answers.installation}</p>
            
## Usage
<p>${answers.usage}</p>
            
## Credits
### Author
<p>${answers.selfCreditName} | <a href="${answers.selfGithub}">Github Profile</a></p>
            
### Collaborators
${collaborators.map(collaborator => `<p>${collaborator.name} | <a href="${collaborator.link}">Github Profile</a></p>`).join('')}
            
### Third-Party Assets
${thirdPartyAnswers.map(asset => `<p>${asset.name} | <a href="${asset.link}">${asset.link}</a></p>`).join('')}
            
## Questions
<p>For questions, please contact me via <a href="${answers.selfGithub}">Github</a>.</p>
            
## License
<p>${licenseInfo.name}</p>
<p>License Information: <a href="${licenseInfo.link}">${licenseInfo.link}</a></p>`;

    const directory = path.join(process.cwd(), 'Generated README'); // Directory path for generated README.md file
    const filename = path.join(directory, 'README.md'); // File path for generated README.md file

    mkdir(directory, { recursive: true }) // Create directory for generated README.md file as specified in application README file usage instructions
        .then(() => writeFile(filename, readmeContent)) // Write generated README.md file to specified directory
        .then(() => console.log('README.md file successfully created!')) // Log success message to console
        .catch(err => console.error('Error generating README.md file:', err)); // Log error message to console if README.md file is not successfully created
};

async function startPrompts() { // Function to begin prompting user for input
    const initialAnswers = await inquirer.prompt(questions);
        Object.assign(answers, initialAnswers); // Assign user answers to answers object
        await askCollaborator(); // Call askCollaborator function to determine if there are any collaborators on the project to move through prompt sections
    };

startPrompts(); // Call startPrompts function to execute application              

