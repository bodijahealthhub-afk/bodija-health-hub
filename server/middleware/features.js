const { getFlag } = require('../utils/features');

// Blocks a route when the given feature flag is not enabled.
// Returns 404 so disabled features look like they never existed publicly.
function requireFeature(featureKey) {
  return async (req, res, next) => {
    try {
      const flag = await getFlag(featureKey);
      if (flag && flag.enabled) {
        return next();
      }
      return res.status(404).json({ error: 'Not Found' });
    } catch (err) {
      console.error(`Failed to check feature "${featureKey}":`, err.message);
      return res.status(500).json({ error: 'Server error' });
    }
  };
}

module.exports = { requireFeature };
