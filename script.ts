import fs from 'fs';

// Define the contract notification interface
interface ContractNotification {
    [contractId: number]: {
        notified_on: string;
        reason: string;
    };
}

// Define the output interface 
interface OutputContracts {
    "software_name": string,
    "owner": string,
    "organization": string,
    "annual_cost_eur": number,
    "renewal_date": string,
    "reason": string
}

// set the date and read the contracts and config
let currentDate = new Date(Date.now());
let contracts = JSON.parse(fs.readFileSync('contracts.json', 'utf8'));
let config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

let log: ContractNotification;
if (fs.existsSync('notification_log.json')) {
    const notiFile = fs.readFileSync('notification_log.json', 'utf8');
    if (notiFile.trim() === '') {
        fs.writeFileSync('notification_log.json', '{}');
        log = {};
    } else {
        log = JSON.parse(notiFile);
    }
} else {
    fs.writeFileSync('notification_log.json', '{}');
    log = {};
}

// JSON Array to store the output
let output: OutputContracts[] = []

// loop through the contracts and check if they are due for notification
for (let contract of contracts) {
    // Check if contract.id is already in the notification log
    let notifiedPrevously = log[contract.id];

    if (notifiedPrevously && notifiedPrevously.reason === "Urgent") {
        continue;
    }

    // get the contract renewal date and annual cost
    let contract_renewal_date = new Date(contract.renewal_date);
    let contract_annual_cost = contract.annual_cost_eur;
    let days_until_renewal = Math.ceil((contract_renewal_date.getTime() - currentDate.getTime()) / 86400000);
    let reason;

    // if previously notified for another reason, check if reason turns to Urgent
    if (notifiedPrevously) {
        if (days_until_renewal > 3) {
            continue;
        }
    }

    // Check conditions using config rules in priority order
    for (let rule of config.rules) {
        if (days_until_renewal <= rule.days_to_expiry) {
            // Check if there's a minimum annual cost requirement
            if (rule.min_annual_cost) {
                if (contract_annual_cost >= rule.min_annual_cost) {
                    reason = rule.reason;
                    break;
                }
            } else {
                reason = rule.reason;
                break;
            }
        }
    }

    // if reason given, generate notification and output
    if (reason) {
        // Add to the log dictionary
        log[contract.id] = {
            notified_on: currentDate.toISOString().slice(0, 10),
            reason: reason
        };

        const o: OutputContracts = {
            "software_name": contract.software_name,
            "owner": contract.owner,
            "organization": contract.organization,
            "annual_cost_eur": contract_annual_cost.toFixed(2),
            "renewal_date": contract_renewal_date.toISOString().slice(0, 10),
            "reason": reason
        }
        output.push(o);
    }
}

fs.writeFileSync('notification_log.json', JSON.stringify(log, null, 2))
if (output.length == 0) {
    console.log("No New Notifications!")
} else {
    console.log(output);
}
