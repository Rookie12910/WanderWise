/**
 * Utility functions for group trip budget calculations
 */

/**
 * Calculate the per-person budget for a group trip
 * @param {number} budgetPerPerson - The budget per person for the trip
 * @param {number} currentMembers - Current number of members in the group
 * @param {number} maxPeople - Maximum number of people allowed in the group
 * @returns {object} Object containing per-person costs and total budget info
 */
export const calculatePerPersonBudget = (budgetPerPerson, currentMembers = 1, maxPeople = 1) => {
    if (!budgetPerPerson || budgetPerPerson <= 0) {
        return {
            currentPerPerson: 0,
            maxCapacityPerPerson: 0,
            totalBudget: 0,
            savings: 0,
            savingsPercentage: 0
        };
    }

    // Ensure minimum of 1 member
    const actualCurrentMembers = Math.max(1, currentMembers || 1);
    const actualMaxPeople = Math.max(1, maxPeople || 1);

    // If budget is per person, it stays the same regardless of group size
    const currentPerPerson = budgetPerPerson;
    const maxCapacityPerPerson = budgetPerPerson;
    const totalBudget = budgetPerPerson * actualCurrentMembers;
    const totalBudgetWhenFull = budgetPerPerson * actualMaxPeople;

    return {
        currentPerPerson: Math.round(currentPerPerson),
        maxCapacityPerPerson: Math.round(maxCapacityPerPerson),
        totalBudget: Math.round(totalBudget),
        totalBudgetWhenFull: Math.round(totalBudgetWhenFull),
        savings: 0, // No savings in per-person budget model
        savingsPercentage: 0
    };
};

/**
 * Calculate budget for shared cost model (where total cost is fixed)
 * @param {number} totalBudget - The total fixed budget for the trip
 * @param {number} currentMembers - Current number of members in the group
 * @param {number} maxPeople - Maximum number of people allowed in the group
 * @returns {object} Object containing per-person costs with potential savings
 */
export const calculateSharedBudget = (totalBudget, currentMembers = 1, maxPeople = 1) => {
    if (!totalBudget || totalBudget <= 0) {
        return {
            currentPerPerson: 0,
            maxCapacityPerPerson: 0,
            savings: 0,
            savingsPercentage: 0
        };
    }

    const actualCurrentMembers = Math.max(1, currentMembers || 1);
    const actualMaxPeople = Math.max(1, maxPeople || 1);

    const currentPerPerson = totalBudget / actualCurrentMembers;
    const maxCapacityPerPerson = totalBudget / actualMaxPeople;
    const savings = currentPerPerson - maxCapacityPerPerson;
    const savingsPercentage = actualMaxPeople > actualCurrentMembers ? 
        ((savings / currentPerPerson) * 100) : 0;

    return {
        currentPerPerson: Math.round(currentPerPerson),
        maxCapacityPerPerson: Math.round(maxCapacityPerPerson),
        savings: Math.round(savings),
        savingsPercentage: Math.round(savingsPercentage * 100) / 100
    };
};

/**
 * Format budget display text with currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol (default: ৳)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = '৳') => {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return 'N/A';
    }
    return `${currency}${Math.round(amount).toLocaleString()}`;
};

/**
 * Generate budget display text for group trips (per-person budget model)
 * @param {number} budgetPerPerson - Budget per person
 * @param {number} currentMembers - Current members
 * @param {number} maxPeople - Maximum people
 * @returns {object} Object with formatted budget strings
 */
export const getBudgetDisplayInfo = (budgetPerPerson, currentMembers, maxPeople) => {
    const budgetInfo = calculatePerPersonBudget(budgetPerPerson, currentMembers, maxPeople);
    
    return {
        currentPerPersonText: formatCurrency(budgetInfo.currentPerPerson),
        totalBudgetText: formatCurrency(budgetInfo.totalBudget),
        membersText: `${currentMembers}/${maxPeople} members`,
        // No savings in per-person model
        savingsText: null,
        maxCapacityText: null,
        savingsPercentage: 0
    };
};
