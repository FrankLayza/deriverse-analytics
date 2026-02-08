const drv = require('@deriverse/kit');

/**
 * This script crawls the @deriverse/kit to discover all available 
 * functionality for building the analytics dashboard.
 */
function crawlDeriverse() {
    console.log("=== [1] Top-Level Package Exports ===");
    const exports = Object.keys(drv);
    console.log(exports);

    if (drv.Engine) {
        console.log("\n=== [2] Engine Class Methods (Prototype) ===");
        
        // Get all properties from the Engine prototype
        const engineMethods = Object.getOwnPropertyNames(drv.Engine.prototype)
            .filter(prop => typeof drv.Engine.prototype[prop] === 'function');
        
        console.log(engineMethods);

        // Optional: Check if there are static methods on the Engine class itself
        const staticMethods = Object.getOwnPropertyNames(drv.Engine)
            .filter(prop => typeof drv.Engine[prop] === 'function');
        
        if (staticMethods.length > 1) { // 'length' and 'prototype' are default
            console.log("\n=== [3] Engine Static Methods ===");
            console.log(staticMethods);
        }
    } else {
        console.log("Could not find Engine class in exports.");
    }

    console.log("\n=== [4] Potential Structure Models ===");
    // Often models are exported under specific namespaces
    if (drv.StructureModels) {
        console.log(Object.keys(drv.StructureModels));
    } else {
        console.log("No explicit StructureModels export found. Checking common keys...");
        const models = exports.filter(e => e.includes('Model') || e.includes('Data'));
        console.log(models);
    }
}

try {
    crawlDeriverse();
} catch (error) {
    console.error("Crawl failed. Make sure @deriverse/kit is installed.");
    console.error(error.message);
}