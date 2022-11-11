const https = require("https");
const http = require("http");

const fs = require("fs");
const options = {
  key: fs.readFileSync("../key.pem"),
  cert: fs.readFileSync("../cert.pem"),
};
require("dotenv").config({ path: require("find-config")(".env") });
const app = require("./app");

const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

function setHttpServers() {
  const ports = {
    https: process.env.HTTPS_PORT,
  };

  Object.keys(ports).forEach((method) => {
    const port = normalizePort(ports[method]);
    app.set("port", port);

    const errorHandler = (error) => {
      if (error.syscall !== "listen") {
        throw error;
      }
      const address = server.address();
      const bind =
        typeof address === "string" ? "pipe " + address : "port: " + port;
      switch (error.code) {
        case "EACCES":
          console.error(bind + " requires elevated privileges.");
          process.exit(1);
          break;
        case "EADDRINUSE":
          console.error(bind + " is already in use.");
          process.exit(1);
          break;
        default:
          throw error;
      }
    };

    const server =
      method == "https"
        ? https.createServer(options, app)
        : http.createServer(app);

    server.on("error", errorHandler);
    server.on("listening", () => {
      const address = server.address();
      const bind =
        typeof address === "string" ? "pipe " + address : "port " + port;
      console.log("Listening on " + bind);
    });

    server.listen(port);
  });
}

setHttpServers();
