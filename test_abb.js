import { calculateABB } from './update bl/frontend/src/utils/abbCalculator.js';

// Dummy dataset 1 (consolidated)
const ds1 = [
    { Date: '2024-01-05', Balance: 100 },
    { Date: '2024-06-30', Balance: 100 }
];

// Account A
const accA = [
    { Date: '2024-01-05', Balance: 50 },
    { Date: '2024-06-30', Balance: 50 }
];

// Account B
const accB = [
    { Date: '2024-01-05', Balance: 150 },
    { Date: '2024-06-30', Balance: 150 }
];

const accounts = [
    { dataset_1: accA },
    { dataset_1: accB }
];

const result = calculateABB(ds1, {}, accounts);

console.log("Combined 180 ABB:", result.calc180.averageBalance);
console.log("Account A + B 180 ABB:", result.comparisons[0].calculations[0].abb);
