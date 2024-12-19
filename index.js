import { writeFile, mkdir } from 'fs/promises'; // Import built-in Node.js write file and create directory functions using fs/promises
import inquirer from 'inquirer'; // Import inquirer for prompting user questions from npm package
import path from 'path'; // Import path for joining file paths from built-in Node.js module


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
            message: 'Please provide a link to your GitHub profile.',
            name: 'selfGithub',
        },
        {
            type: 'confirm', // Confirm question type prompts user to answer yes or no
            message: 'Did you have any collaborators on this project?',
            name: 'collaborators',
        },
    ];

    inquirer.prompt(questions).then(answers => { // Store user answers in answers object
            const collaborators = []; // Array to store collaborators in the event there are multiple
            
            function askCollaborator() { // Function to collect collaborator information
                inquirer.prompt([ 
                    {
                        type: 'input',
                        message: 'List the first collaborater to your project',
                        name: 'othersCreditName',
                    },
                    {
                        type: 'input',
                        message: 'Please add a link to their GitHub profile.',
                        name: 'othersGithub',
                    },
                    {
                        type: 'confirm',
                        message: 'Do you have more collaborators to add?',
                        name: 'addAnotherCollaborator',
                    }
            ]).then(collaboratorAnswers => { // Store collaborator answers in collaboratorAnswers object
                collaborators.push({ // Adds collaborator information to collaborators array
                    name: collaboratorAnswers.othersCreditName,
                    github: collaboratorAnswers.othersGithub,
                });

                if (collaboratorAnswers.addAnotherCollaborator) { // If user answers yes to adding another collaborator, run askCollaborator function again
                    askCollaborator();
                } else { // If user answers no, run askThirdPartyAssets function defined below to continue with prompts
                    askThirdPartyAssets();
                }
            });
        }
                function askThirdPartyAssets() { // Function to collect third-party asset information
                    inquirer.prompt([
                        {
                            type: 'confirm',
                            message: 'Did you use any third-party assets for this project, for example: npm packages or online tutorials?',
                            name: 'thirdPartyAssets',
                        }
                    ]).then(thirdPartyAnswers => { // Store third-party asset answers in thirdPartyAnswers object
                        if (thirdPartyAnswers.thirdPartyAssets) {
                            const thirdPartyLinks = []; // Array to store third-party asset links in the event there are multiple

                            function askThirdPartyLink() { // Function to collect third-party asset links
                            inquirer.prompt([
                                {
                                    type: 'input',
                                    message: 'Provide a link to the first asset.',
                                    name: 'thirdPartyLink',
                                },
                                {
                                type: 'confirm',
                                message: 'Do you have more third-party assets to add?',
                                name: 'addAnotherThirdParty',
                                }
                            ]).then(thirdPartyLinkAnswers => { // Store third-party asset link answers in thirdPartyLinkAnswers object
                                thirdPartyLinks.push(thirdPartyLinkAnswers.thirdPartyLink); // Adds third-party asset link to thirdPartyLinks array

                                if (thirdPartyLinkAnswers.addAnotherThirdParty) { // If user answers yes to adding another third-party asset, run askThirdPartyLink function again
                                    askThirdPartyLink();
                                } else { // If user answers no, run askLicense function defined below to continue with prompts
                                    askLicense(thirdPartyLinks); 
                                }
                            });
                        }
                        askThirdPartyLink();
                } else {
                    askLicense([]);
                }
            });
        }
        function askLicense(thirdPartyLinks) { // Function to collect license information
            inquirer.prompt([
                {
                type: 'confirm',
                message: 'Does your project have a license?',
                name: 'licenseCheck',
            }
    ]).then(licenseAnswers => {
        if (licenseAnswers.licenseCheck) {
            inquirer.prompt([
                {
                    type: 'input',
                    message: 'Which license are you using?',
                    name: 'license',
                },
                {
                    type: 'input',
                    message: 'Provide a link to the license.',
                    name: 'licenseLink',
                }
]).then(licenseInfo => { // Store license answers in licenseInfo object
    generateReadme(answers, collaborator, thirdPartyLinks, licenseInfo); // Call generateReadme function with user answers now that all prompts are complete and all rqeuired information is collected if license is provided
});
} else {
    generateReadme(answers, collaborators, thirdPartyLinks, {}); // Call generateReadme function with user answers now that all prompts are complete and all required information is collected if no license is provided
}
});
}

if (answers.collaborators) { 
    askCollaborator();
} else {
    askThirdPartyAssets();
} 
});

function generateReadme(answers, collaborators, thirdPartyLinks, licenseInfo) { // Function to generate README.md file

    // Below is the template literal for the README.md file that will be generated
    const readmeContent = `
    # ${answers.title}

    ## Description
    ${answers.description}

    ## Table of Contents
    - [Installation](#installation)
    - [Usage](#usage)
    - [Credits](#credits)
    - [License](#license)

    ## Installation
    ${answers.installation}

    ## Usage
    ${answers.usage}

    ## Credits
    ### Author
    ${answers.selfCreditName} | <a href="${answers.selfGithub}">Github</a>

    ### Collaborators
    ${collaborators.map(collaborator => `${collaborator.name} | <a href="${collaborator.github}">Github</a>`.join('\n'))}

    ### Third-Party Assets
    ${thirdPartyLinks.map(link => `<a href="${link}">${link}</a>`).join('\n')}

    ## License
    ${licenseInfo.license ? `<a href="${licenseLink}"${licenseInfo.license}</a>` : 'This project is not licensed.'}
    `;

    const directory = path.join(process.cwd(), 'Generated README'); // Directory path for generated README.md file
    const filename = path.join(directory, 'README.md'); // File path for generated README.md file

    mkdir(directory, { recursive: true }) // Create directory for generated README.md file as specified in application README file usage instructions
    .then(() => writeFile(filename, readmeContent)) // Write generated README.md file to specified directory
    .then(() => console.log('README.md file successfully created!')) // Log success message to console
    .catch(err => console.error('Error generating README.md file:', err)); // Log error message to console if README.md file is not successfully created
}