export default function apify(baseUrl, headers = { "Content-Type": "application/json" }) {
  const doFetch = async (method, url, body) => {
    const isBodyValid = body !== undefined && method !== "GET" && method !== "DELETE";
    const strippedUrl = url.replace(/^\/+/, "");
    const response = await fetch(`${baseUrl}/${strippedUrl}`, {
      method,
      headers,
      ...( isBodyValid ? {body: JSON.stringify(body)} : {} )
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error( await response.text() );
    }
  };

  return {
    get: async (url) => await doFetch("GET", url),
    put: async (url, body) => await doFetch("PUT", url, body),
    post: async (url, body) => await doFetch("POST", url, body),
    patch: async (url, body) => await doFetch("PATCH", url, body),
    delete: async (url) => await doFetch("DELETE", url),
  };
};