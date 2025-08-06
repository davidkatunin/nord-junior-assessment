import fs from 'fs';

// interface to for successful output object
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
let contracts = JSON.parse(fs.readFileSync('./data/contracts.json', 'utf8'));
let config = JSON.parse(fs.readFileSync('./data/config.json', 'utf8'));

// load notification log
let log: any = {};
if (fs.existsSync('./output/notification_log.json')) {
    const notiFile = fs.readFileSync('./output/notification_log.json', 'utf8');
    if (notiFile.trim() !== '') {
        log = JSON.parse(notiFile);
    }
}

// JSON Array to store the output
let output: OutputContracts[] = []

// loop through the contracts and check if they are due for notification
for (let contract of contracts) {
    // get the contract renewal date and annual cost
    let contract_renewal_date = new Date(contract.renewal_date);
    let contract_annual_cost = contract.annual_cost_eur;
    let days_until_renewal = Math.ceil((contract_renewal_date.getTime() - currentDate.getTime()) / 86400000);
    let reason;

    // check rules in order of priority
    for (let rule of config.rules) {
        if (days_until_renewal <= rule.days_to_expiry) {
            // if rule has a min cost, run logic to check if it is met
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

    // if reason given, check if we should notify
    if (reason) {
        // check if we should notify based on priority
        const previousReason = log[contract.id]?.recent_notification?.reason;
        const previousPriority = previousReason ? config.priority.indexOf(previousReason) : -1;
        const currentPriority = config.priority.indexOf(reason);
        
        // check if current priority is higher OR if no previous notification
        if (previousPriority === -1 || currentPriority < previousPriority) {
            // setup notification history if first time
            if (!log[contract.id]) {
                log[contract.id] = { notifications: [] };
            }
            
            // add new notification
            let newNotification = {
                notified_on: currentDate.toISOString().slice(0, 10),
                reason: reason
            };
            
            log[contract.id].notifications.push(newNotification);
            log[contract.id].recent_notification = newNotification;

            // generate output for new notification
            const o: OutputContracts = {
                "software_name": contract.software_name,
                "owner": contract.owner,
                "organization": contract.organization,
                "annual_cost_eur": contract_annual_cost,
                "renewal_date": contract_renewal_date.toISOString().slice(0, 10),
                "reason": reason
            }
            output.push(o);
        }
    }
}

// write to notification_log and console log the output
fs.writeFileSync('./output/notification_log.json', JSON.stringify(log, null, 2))
if (output.length == 0) {
    console.log("No New Notifications!")
} else {
    console.log(JSON.stringify(output, null, 2));
}
