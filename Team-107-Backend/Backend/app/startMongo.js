const { spawn } = require("child_process");
const path = require("path");

function startMongoDB() {
  const dbPath = path.join(process.cwd(), "Backend/data");
  
  // Start mongod process
  const mongod = spawn("mongod", ["--dbpath", dbPath], {
    stdio: "ignore" // show logs in terminal
  });

  mongod.on("error", (err) => {
    console.error("Failed to start MongoDB:", err);
  });

  // Kill mongod when Node exits
  process.on("exit", () => mongod.kill());
  process.on("SIGINT", () => {
    mongod.kill();
    process.exit(0);
  });
}

// Export function for CommonJS
module.exports = { startMongoDB };
