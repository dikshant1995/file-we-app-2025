/**
 * Master configuration for institutional-specific ABB rules.
 * Mapped from the provided Excel screenshots.
 */
export const nbfcConfig = [
  {
    name: "ADITYA BIRLA",
    dates: [5, 10, 15, 20, 25],
    minDays: 30
  },
  {
    name: "AXIS BANK LTD.",
    dates: [5, 10, 15, 25],
    minDays: 30
  },
  {
    name: "AXIS FINANCE",
    dates: null, // True Daily
    minDays: 180
  },
  {
    name: "BAJAJ",
    dates: [2, 10, 20, 30],
    minDays: 30
  },
  {
    name: "BANDHAN BANK",
    dates: [5, 10, 15, 20, 25, 30, 31],
    minDays: 365,
    note: "One year banking mandatory"
  },
  {
    name: "CLIX CAPITAL",
    dates: null,
    minDays: 180
  },
  {
    name: "FEDBANK FINANCE LTD",
    dates: [1, 5, 10, 15, 20, 25],
    minDays: 30
  },
  {
    name: "FULLERTON / SMFG INDIA",
    dates: null,
    minDays: 180
  },
  {
    name: "GODREJ CAPITAL",
    dates: [5, 15, 25, 30],
    minDays: 30
  },
  {
    name: "HDFC BANK",
    dates: null,
    minDays: 365
  },
  {
    name: "IDFC FIRST BANK",
    dates: null,
    minDays: 180
  },
  {
    name: "KOTAK MAHINDRA BANK",
    dates: [1, 5, 10, 15, 25],
    minDays: 30
  },
  {
    name: "L&T FINANCIAL SERVICE",
    dates: null,
    minDays: 180
  },
  {
    name: "LENDINGKART",
    dates: null,
    minDays: 365
  },
  {
    name: "MAGMA / POONAWALA FINANCE",
    minDays: 180,
    variants: [
      { label: "Series A", dates: [2, 5, 10, 15, 20, 25, 30] },
      { label: "Series B (3rd Seq)", dates: [2, 7, 12, 17, 22, 27] }
    ]
  },
  {
    name: "MAS FINANCE",
    dates: null,
    minDays: 180
  },
  {
    name: "PIRAMAL CAPITAL",
    dates: [5, 15, 25, 30],
    minDays: 30
  },
  {
    name: "SHRIRAM FINANCE",
    dates: null,
    minDays: 180
  },
  {
    name: "SMC FINANCE",
    dates: null,
    minDays: 365
  },
  {
    name: "TATA CAPITAL FINANCE",
    dates: null,
    minDays: 180
  },
  {
    name: "UGRO CAPITAL",
    dates: null,
    minDays: 365
  },
  {
    name: "YES BANK",
    dates: null,
    minDays: 180
  }
];

export const getDefaultConfig = () => {
  return [
    { name: "Standard Pattern 1", dates: [5, 10, 15, 20, 25] },
    { name: "Standard Pattern 2", dates: [5, 10, 15, 25] },
    { name: "Standard Pattern 3", dates: [2, 10, 20, 30] },
    { name: "Standard Pattern 4", dates: [1, 5, 10, 15, 20, 25] }
  ];
};
