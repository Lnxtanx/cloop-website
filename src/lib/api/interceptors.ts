/**
 * Global fetch interceptor to handle session timeouts and expired authentication tokens.
 */

if (typeof window !== "undefined") {
  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    const response = await originalFetch(...args);

    // Identify if the request URL is targeted at our internal API
    const requestUrl = typeof args[0] === "string" ? args[0] : (args[0] as Request).url;

    if (requestUrl.includes("/api/") && (response.status === 401 || response.status === 403)) {
      const clonedResponse = response.clone();
      try {
        const data = await clonedResponse.json();
        
        // If the error indicates token expiry or access token requirements
        if (
          data?.error === "Invalid or expired token" || 
          data?.error === "Access token required"
        ) {
          localStorage.removeItem("cloop_token");
          localStorage.removeItem("cloop_user");

          // Only redirect if the user is not currently on the landing page or signup page
          if (
            window.location.pathname !== "/" && 
            !window.location.pathname.includes("/signup")
          ) {
            window.location.href = "/";
          }
        }
      } catch {
        // Silent catch for parsing errors (e.g. non-JSON responses)
      }
    }

    return response;
  };
}
