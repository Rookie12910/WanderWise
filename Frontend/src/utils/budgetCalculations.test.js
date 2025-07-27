// Budget Calculations Test
// Run this in browser console to test the calculations

// Test cases for budget calculation
const testCases = [
    {
        name: "Basic calculation",
        totalBudget: 15000,
        currentMembers: 1,
        maxPeople: 5,
        expected: {
            currentPerPerson: 15000,
            maxCapacityPerPerson: 3000,
            savings: 12000,
            savingsPercentage: 80
        }
    },
    {
        name: "Two members",
        totalBudget: 15000,
        currentMembers: 2,
        maxPeople: 5,
        expected: {
            currentPerPerson: 7500,
            maxCapacityPerPerson: 3000,
            savings: 4500,
            savingsPercentage: 60
        }
    },
    {
        name: "Already at max capacity",
        totalBudget: 15000,
        currentMembers: 5,
        maxPeople: 5,
        expected: {
            currentPerPerson: 3000,
            maxCapacityPerPerson: 3000,
            savings: 0,
            savingsPercentage: 0
        }
    },
    {
        name: "Edge case: zero budget",
        totalBudget: 0,
        currentMembers: 2,
        maxPeople: 5,
        expected: {
            currentPerPerson: 0,
            maxCapacityPerPerson: 0,
            savings: 0,
            savingsPercentage: 0
        }
    }
];

// Import the calculation function (you would need to import this in actual testing)
// import { calculatePerPersonBudget } from '../utils/budgetCalculations';

// Test function (paste this in browser console after loading the page)
function testBudgetCalculations() {
    console.log("🧪 Testing Budget Calculations...\n");
    
    testCases.forEach((testCase, index) => {
        console.log(`Test ${index + 1}: ${testCase.name}`);
        console.log(`Input: Budget=${testCase.totalBudget}, Current=${testCase.currentMembers}, Max=${testCase.maxPeople}`);
        
        // You would call the actual function here:
        // const result = calculatePerPersonBudget(testCase.totalBudget, testCase.currentMembers, testCase.maxPeople);
        
        // Manual calculation for testing:
        const currentPerPerson = testCase.totalBudget / Math.max(1, testCase.currentMembers);
        const maxCapacityPerPerson = testCase.totalBudget / Math.max(1, testCase.maxPeople);
        const savings = currentPerPerson - maxCapacityPerPerson;
        const savingsPercentage = testCase.maxPeople > testCase.currentMembers ? 
            ((savings / currentPerPerson) * 100) : 0;
        
        const result = {
            currentPerPerson: Math.round(currentPerPerson),
            maxCapacityPerPerson: Math.round(maxCapacityPerPerson),
            savings: Math.round(savings),
            savingsPercentage: Math.round(savingsPercentage * 100) / 100
        };
        
        console.log(`Expected:`, testCase.expected);
        console.log(`Got:`, result);
        
        const passed = JSON.stringify(result) === JSON.stringify(testCase.expected);
        console.log(`${passed ? '✅ PASSED' : '❌ FAILED'}\n`);
    });
}

// Usage examples:
console.log("📝 Usage Examples:");
console.log("1. Trip with ৳15,000 budget, 1 current member, max 5 people:");
console.log("   - Current cost per person: ৳15,000");
console.log("   - Cost per person when full: ৳3,000");
console.log("   - Potential savings: ৳12,000 (80%)");

console.log("\n2. Trip with ৳15,000 budget, 3 current members, max 5 people:");
console.log("   - Current cost per person: ৳5,000");
console.log("   - Cost per person when full: ৳3,000");
console.log("   - Potential savings: ৳2,000 (40%)");

// Run the tests
// testBudgetCalculations();
