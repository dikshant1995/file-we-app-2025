/**
 * ========================================
 * 🚫 PROCESSING FEE GUARD - 5 LAYER SYSTEM
 * ========================================
 * 
 * This module implements a 5-layer protection system to ensure
 * processing fees are NEVER calculated, used, or displayed anywhere
 * in the system.
 * 
 * LAYERS:
 * 1. Input Sanitization - Remove processingFee from any input data
 * 2. Output Filtering - Remove processingFee from any output data
 * 3. Validation Layer - Throw errors if processingFee is detected
 * 4. Monitor Layer - Log warnings if processingFee is attempted
 * 5. Emergency Override - Force remove processingFee in production
 */

// ========================================
// LAYER 1: INPUT SANITIZATION
// ========================================
/**
 * Remove processingFee from input data
 * Prevents processing fee data from entering the system
 */
export const sanitizeInput = (data) => {
  if (!data || typeof data !== 'object') return data;
  
  const sanitized = { ...data };
  
  // Remove processingFee if it exists
  if ('processingFee' in sanitized) {
    delete sanitized.processingFee;
    console.warn('⚠️ LAYER 1 ACTIVATED: processingFee removed from input');
  }
  
  return sanitized;
};

// ========================================
// LAYER 2: OUTPUT FILTERING
// ========================================
/**
 * Remove processingFee from output data
 * Ensures processing fee never reaches the frontend
 */
export const filterOutput = (data) => {
  if (!data) return data;
  
  // Handle array of results (multiple banks)
  if (Array.isArray(data)) {
    return data.map(item => filterSingleOutput(item));
  }
  
  // Handle single result
  return filterSingleOutput(data);
};

const filterSingleOutput = (data) => {
  if (!data || typeof data !== 'object') return data;
  
  const filtered = { ...data };
  
  // Remove processingFee if it exists
  if ('processingFee' in filtered) {
    delete filtered.processingFee;
    console.warn('⚠️ LAYER 2 ACTIVATED: processingFee removed from output');
  }
  
  return filtered;
};

// ========================================
// LAYER 3: VALIDATION LAYER
// ========================================
/**
 * Validate that data does NOT contain processingFee
 * Throws error in development if detected
 */
export const validateNoProcessingFee = (data, context = 'unknown') => {
  if (!data) return true;
  
  const checkForProcessingFee = (obj, path = '') => {
    if (!obj || typeof obj !== 'object') return;
    
    // Check current level
    if ('processingFee' in obj) {
      const errorMsg = `🚨 LAYER 3 ALERT: processingFee detected in ${context} at path: ${path}`;
      console.error(errorMsg);
      
      // In development, throw error to catch violations immediately
      // Check for development mode in both Node.js and browser environments
      const isDevelopment = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') ||
                           (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV);
      
      if (isDevelopment) {
        throw new Error(errorMsg);
      }
      
      return false;
    }
    
    // Recursively check nested objects
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        checkForProcessingFee(value, path ? `${path}.${key}` : key);
      }
    }
  };
  
  if (Array.isArray(data)) {
    data.forEach((item, index) => checkForProcessingFee(item, `[${index}]`));
  } else {
    checkForProcessingFee(data);
  }
  
  return true;
};

// ========================================
// LAYER 4: MONITOR LAYER
// ========================================
/**
 * Monitor and log any attempts to use processingFee
 * Creates audit trail of violations
 */
let violationCount = 0;
const violations = [];

export const monitorProcessingFee = (data, source = 'unknown') => {
  if (!data) return;
  
  const detectProcessingFee = (obj, path = '') => {
    if (!obj || typeof obj !== 'object') return;
    
    if ('processingFee' in obj) {
      violationCount++;
      const violation = {
        timestamp: new Date().toISOString(),
        source: source,
        path: path,
        value: obj.processingFee,
        count: violationCount
      };
      
      violations.push(violation);
      
      console.warn(`🚨 LAYER 4 MONITOR: Processing fee violation #${violationCount}`, violation);
    }
    
    // Check nested objects
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        detectProcessingFee(value, path ? `${path}.${key}` : key);
      }
    }
  };
  
  if (Array.isArray(data)) {
    data.forEach((item, index) => detectProcessingFee(item, `[${index}]`));
  } else {
    detectProcessingFee(data);
  }
};

export const getViolationReport = () => ({
  totalViolations: violationCount,
  violations: violations,
  lastViolation: violations[violations.length - 1] || null
});

// ========================================
// LAYER 5: EMERGENCY OVERRIDE
// ========================================
/**
 * Emergency override - Force remove processingFee
 * This is the final failsafe that runs in production
 */
export const emergencyCleanup = (data) => {
  if (!data) return data;
  
  const deepClean = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(item => deepClean(item));
    }
    
    // Handle objects
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip processingFee entirely
      if (key === 'processingFee') {
        console.error('🚨 LAYER 5 EMERGENCY: Force removed processingFee');
        continue;
      }
      
      // Recursively clean nested objects
      if (typeof value === 'object' && value !== null) {
        cleaned[key] = deepClean(value);
      } else {
        cleaned[key] = value;
      }
    }
    
    return cleaned;
  };
  
  return deepClean(data);
};

// ========================================
// COMBINED PROTECTION
// ========================================
/**
 * Apply ALL 5 layers of protection
 * This is the recommended function to use
 */
export const protectAgainstProcessingFee = (data, context = 'unknown') => {
  console.log(`🛡️ Applying 5-layer protection for: ${context}`);
  
  // Layer 1: Sanitize input
  let cleanData = sanitizeInput(data);
  
  // Layer 2: Filter output
  cleanData = filterOutput(cleanData);
  
  // Layer 3: Validate (just log, don't throw to prevent app breakage)
  try {
    validateNoProcessingFee(cleanData, context);
  } catch (err) {
    console.warn('⚠️ Layer 3 validation warning:', err.message);
  }
  
  // Layer 4: Monitor violations
  monitorProcessingFee(cleanData, context);
  
  // Layer 5: Emergency cleanup (failsafe)
  cleanData = emergencyCleanup(cleanData);
  
  console.log(`✅ 5-layer protection complete for: ${context}`);
  
  return cleanData;
};

// ========================================
// UTILITY: Check if system is clean
// ========================================
export const isSystemClean = () => {
  return violationCount === 0;
};

export const resetMonitor = () => {
  violationCount = 0;
  violations.length = 0;
  console.log('🔄 Monitor reset - violation count cleared');
};

// ========================================
// EXPORT ALL LAYERS
// ========================================
export default {
  // Individual layers
  sanitizeInput,
  filterOutput,
  validateNoProcessingFee,
  monitorProcessingFee,
  emergencyCleanup,
  
  // Combined protection
  protectAgainstProcessingFee,
  
  // Utilities
  getViolationReport,
  isSystemClean,
  resetMonitor
};
