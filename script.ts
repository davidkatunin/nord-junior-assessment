import fs from 'fs';

// Define the contract notification interface
interface ContractNotification {
    contract_id: {
        notified_on: string;
        reason: string;
    };
}

// set the date and read the contracts and config
let currentDate = new Date(Date.now());
let contracts = JSON.parse(fs.readFileSync('contracts.json', 'utf8'));
let config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// loop through the contracts and check if they are due for notification
for (let contract of contracts) {
    // get the contract renewal date and annual cost
    let contract_renewal_date = new Date(contract.renewal_date);
    let contract_annual_cost = contract.annual_cost_eur;

    console.log(contract)
}

