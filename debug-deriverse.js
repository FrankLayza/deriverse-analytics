import * as drv from '@deriverse/kit';
import { Engine } from '@deriverse/kit';

/**
 * This script crawls the @deriverse/kit to discover all available 
 * functionality for building the analytics dashboard.
 */
function crawlDeriverse() {
  console.log("=== [1] Top-Level Package Exports ===");
  const exportKeys = Object.keys(drv);
  console.log(exportKeys);

  if (Engine && Engine.prototype) {
    console.log("\n=== [2] Engine Class Methods (Prototype) ===");

    const engineMethods = Object.getOwnPropertyNames(Engine.prototype)
      .filter(prop => typeof Engine.prototype[prop] === 'function' && prop !== 'constructor');

    console.log(engineMethods);

    const staticMethods = Object.getOwnPropertyNames(Engine)
      .filter(prop => typeof Engine[prop] === 'function' && !['length', 'name', 'prototype'].includes(prop));

    if (staticMethods.length > 0) {
      console.log("\n=== [3] Engine Static Methods ===");
      console.log(staticMethods);
    }
  } else {
    console.log("Engine class not found in exports.");
  }

  console.log("\n=== [4] Potential Structure / Model-like Exports ===");

  const possibleModels = exportKeys.filter(
    key =>
      key.toLowerCase().includes('model') ||
      key.toLowerCase().includes('data') ||
      key.toLowerCase().includes('schema') ||
      key.toLowerCase().includes('structure')
  );

  if (possibleModels.length > 0) {
    console.log(possibleModels);
  } else {
    console.log("No model-like exports detected.");
  }
}

try {
  crawlDeriverse();
} catch (error) {
  console.error("Crawl failed. Make sure @deriverse/kit is installed and ESM is enabled.");
  console.error(error);
}