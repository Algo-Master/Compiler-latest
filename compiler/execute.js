const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const outputPath = path.join(__dirname, "executables");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const executeCommand = (command, timeLimit, memoryLimit) => {
  return new Promise((resolve, reject) => {
    const options = {
      timeout: timeLimit, // Time limit in milliseconds
      maxBuffer: memoryLimit * 1024 * 1024, // Memory limit in bytes only for the stdout i.e. the process ends if std size is larger than memory limit
    };

    const child = exec(command, options, (error, stdout, stderr) => {
      if (error) {
        if (error.killed) {
          return reject(new Error("Execution time exceeded the limit"));
        }
        if (error.code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER") {
          return reject(new Error("Memory limit exceeded"));
        }
        return reject(error);
      }
      if (stderr) {
        return reject(new Error(stderr));
      }
      resolve(stdout);
    });

    // Monitor Total Memory usage of the child process every 100 milliseconds
    const checkMemoryUsage = setInterval(() => {
      if (!child.pid) return;

      try {
        const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // in MB
        if (memoryUsage > memoryLimit) {
          child.kill();
          clearInterval(checkMemoryUsage);
          reject(new Error("Memory limit exceeded"));
        }
      } catch (err) {
        child.kill();
        clearInterval(checkMemoryUsage);
        reject(new Error("Memory usage check failed"));
      }
    }, 100);

    // Additional safety measures
    child.on("exit", () => {
      clearInterval(checkMemoryUsage);
    });
  });
};

// executecpp.js
const executecpp = (filePath, inputFilePath) => {
  const jobId = path.basename(filePath).split(".")[0];
  const outputFilename = `${jobId}.exe`;
  // const outputFilename = `${jobId}.out`;
  const outPath = path.join(outputPath, outputFilename);
  const exedir = path.join(__dirname, `executables`);
  const executable = path.join(exedir, outputFilename);

  const command = `g++ ${filePath} -o ${outPath} && cd ${outputPath} && .\\${outputFilename} < ${inputFilePath}`;
  // const command = `g++ ${filePath} -o ${outPath} && cd ${outputPath} && ./${jobId}.out < ${inputFilePath}`;

  return new Promise((resolve, reject) => {
    executeCommand(command, timeLimit = 2000, memoryLimit = 64)
      .then((stdout) => {
        const normalizedOutput = stdout.replace(/\r\n/g, "\n").trim();
        resolve(normalizedOutput);
      })
      .catch((error) => {
        reject(error);
      })
      .finally(() => {
        fs.unlinkSync(inputFilePath);
        fs.unlinkSync(executable);
      });
  });
};

// executejava.js
const executejava = (filePath, inputFilePath) => {
  const command = `java ${filePath} < ${inputFilePath}`;

  return new Promise((resolve, reject) => {
    executeCommand(command, timeLimit = 2000, memoryLimit = 64)
      .then((stdout) => {
        const normalizedOutput = stdout.replace(/\r\n/g, "\n").trim();
        resolve(normalizedOutput);
      })
      .catch((error) => {
        reject(error);
      })
      .finally(() => {
        fs.unlinkSync(inputFilePath);
      });
  });
};

// executePy.js
const executePy = (filePath, inputFilePath) => {
  const command = `python ${filePath} < ${inputFilePath}`;

  return new Promise((resolve, reject) => {
    executeCommand(command, timeLimit = 2000, memoryLimit = 64)
      .then((stdout) => {
        const normalizedOutput = stdout.replace(/\r\n/g, "\n").trim();
        resolve(normalizedOutput);
      })
      .catch((error) => {
        reject(error);
      })
      .finally(() => {
        fs.unlinkSync(inputFilePath);
      });
  });
};

module.exports = { executecpp, executejava, executePy };
