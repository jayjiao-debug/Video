// Scene modules: each registers its scenes at import and exports a boot function. The producer adds entries here.
export const BOOTS: Record<string, () => Promise<void>> = {};
