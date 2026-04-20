import axios from 'axios';

// Map to keep track of active requests
const pendingRequests = new Map();

// Helper to generate a unique key for an API request
const generateRequestKey = (config) => {
  const { method, url, params, data } = config;
  return `${method}:${url}?${new URLSearchParams(params).toString()}:${JSON.stringify(data || {})}`;
};

// Expose these for the Performance Dashboard
export const axiosMetrics = {
  blockedDuplicates: 0,
  rateLimitsHit: 0,
};

// Add interceptor to request
axios.interceptors.request.use((config) => {
  const requestKey = generateRequestKey(config);

  if (pendingRequests.has(requestKey)) {
    // If request already exists, abort the PREVIOUS one
    const previousController = pendingRequests.get(requestKey);
    previousController.abort('AbortDuplicate');
    
    // Track metrics
    axiosMetrics.blockedDuplicates += 1;
    console.warn(`[Axios Deduplicator] Canceled previous in-flight request for: ${config.url}`);
  } 

  const controller = new AbortController();
  config.signal = controller.signal;
  pendingRequests.set(requestKey, controller);

  // Set the key for removal in the response
  config.__requestKey = requestKey;
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add interceptor to response
axios.interceptors.response.use(
  (response) => {
    if (response.config.__requestKey) {
      pendingRequests.delete(response.config.__requestKey);
    }
    return response;
  },
  (error) => {
    if (axios.isCancel(error)) {
      // In many environments, the AbortController message gets stripped into just 'canceled'.
      // We flag all explicit cancellations as duplicates here to prevent UI console spam.
      error.isDuplicate = true;
      return Promise.reject(error);
    }

    if (error.config && error.config.__requestKey) {
      pendingRequests.delete(error.config.__requestKey);
    }

    if (error.response && error.response.status === 429) {
      axiosMetrics.rateLimitsHit += 1;
      console.error(`[Axios Rate Limit] Hit 429 Too Many Requests on ${error.config.url}`);
    }

    return Promise.reject(error);
  }
);
