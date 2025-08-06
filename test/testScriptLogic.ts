const mockContracts = [
    {
        id: 1,
        software_name: "Test Software 1",
        owner: "John Doe",
        organization: "Fake Company 1",
        annual_cost_eur: 15000,
        renewal_date: "2025-08-09"
    },
    {
        id: 2,
        software_name: "Test Software 2", 
        owner: "Jane Smith",
        organization: "Fake Company 2",
        annual_cost_eur: 5000,
        renewal_date: "2025-08-20"
    },
    {
        id: 3,
        software_name: "Test Software 3", 
        owner: "Bob Doe",
        organization: "Fake Company 3",
        annual_cost_eur: 10000,
        renewal_date: "2025-09-08"
    }
];

const mockConfig = {
    rules: [
        {"reason": "Urgent", "days_to_expiry": 3},
        {"reason": "High-Cost", "days_to_expiry": 30, "min_annual_cost": 10000},
        {"reason": "Upcoming", "days_to_expiry": 14}
    ],
    priority: ["Urgent", "High-Cost", "Upcoming"]
};

// LOGIC FROM SCRIPT TO CHECK REASON OF CONTRACT NOTIFICATION
function getReason(contract: any, currentDate: Date): string | null {
    const renewalDate = new Date(contract.renewal_date);
    const daysUntilRenewal = Math.ceil((renewalDate.getTime() - currentDate.getTime()) / 86400000);
    
    // rule priority logic
    for (let rule of mockConfig.rules) {
        if (daysUntilRenewal <= rule.days_to_expiry) {
            if (rule.min_annual_cost) {
                if (contract.annual_cost_eur >= rule.min_annual_cost) {
                    return rule.reason;
                }
            } else {
                return rule.reason;
            }
        }
    }
    return null;
}

// LOGIC FROM SCRIPT TO CHECK IF A CONTRACT NEEDS A NOTIFICATION TO BE GENERATED
function shouldNotify(contractId: number, reason: string, log: any): boolean {
    // checks if the id exists in the log already
    if (!log[contractId]) {
        return true;
    }
    
    //checks if the id has assigned notifications
    if (!log[contractId].notifications) {
        return true;
    }
    
    // check if the given reason has been notified already
    const notifications = log[contractId].notifications;
    let hasAlreadyNotified = false;
    
    for (let i = 0; i < notifications.length; i++) {
        if (notifications[i].reason === reason) {
            hasAlreadyNotified = true;
            break;
        }
    }
    
    // return if the reason has been notified already
    if (hasAlreadyNotified) {
        return false;
    } else {
        return true; 
    }
}

describe('Logic Tests', () => {
    const currentDate = new Date('2025-08-06');

    test('tests date calculation logic', () => {
        const renewalDate = new Date('2025-08-09');
        const days = Math.ceil((renewalDate.getTime() - currentDate.getTime()) / 86400000);
        expect(days).toBe(3);
    });

    test('tests "Urgent" reason', () => {
        const contract = mockContracts[0];
        expect(getReason(contract, currentDate)).toBe('Urgent');
    });

    test('tests "Upcoming" reason', () => {
        const contract = mockContracts[1];
        expect(getReason(contract, currentDate)).toBe('Upcoming');
    });

    test('tests no notification', () => {
        const contract = mockContracts[2];
        expect(getReason(contract, currentDate)).toBeNull();
    });

    test('tests already notified', () => {
        const log = {
            "1": { notifications: [{ reason: "High-Cost" }] }
        };
        expect(shouldNotify(1, "High-Cost", log)).toBe(false);
    });

    test('tests new and higher-priority update', () => {
        const log = {
            "1": { notifications: [{ reason: "High-Cost" }] }
        };
        expect(shouldNotify(1, "Urgent", log)).toBe(true);
    });
});

// NEW TESTS FOR NOTIFICATION AND OUTPUT GENERATION
describe('Notification and Output Generation Tests', () => {
    const currentDate = new Date('2025-08-06');

    test('tests notification generation', () => {
        const log: any = {};
        const contract = mockContracts[0];
        const reason = getReason(contract, currentDate);
        
        if (reason) {
            if (!log[contract.id]) {
                log[contract.id] = { notifications: [] };
            }
            
            const newNotification = {
                notified_on: currentDate.toISOString().slice(0, 10),
                reason: reason
            };
            
            log[contract.id].notifications.push(newNotification);
            log[contract.id].recent_notification = newNotification;
        }

        expect(log[1]).toBeDefined();
        expect(log[1].notifications).toHaveLength(1);
        expect(log[1].notifications[0].reason).toBe('Urgent');
        expect(log[1].recent_notification).toEqual(log[1].notifications[0]);
    });

    test('tests output generation', () => {
        const output: any[] = [];
        const contract = mockContracts[0];
        const reason = getReason(contract, currentDate);
        
        if (reason) {
            const outputContract = {
                software_name: contract.software_name,
                owner: contract.owner,
                organization: contract.organization,
                annual_cost_eur: contract.annual_cost_eur,
                renewal_date: new Date(contract.renewal_date).toISOString().slice(0, 10),
                reason: reason
            };
            output.push(outputContract);
        }

        expect(output).toHaveLength(1);
        expect(output[0].software_name).toBe('Test Software 1');
        expect(output[0].reason).toBe('Urgent');
    });
}); 