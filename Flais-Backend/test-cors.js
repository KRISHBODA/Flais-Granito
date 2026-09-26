const defaultOrigins = [
  "https://flaisgranito.com",
  "https://www.flaisgranito.com"
].filter(Boolean);

const allowedOrigins = new Set([...defaultOrigins]);

console.log("has https://www.flaisgranito.com:", allowedOrigins.has("https://www.flaisgranito.com"));
