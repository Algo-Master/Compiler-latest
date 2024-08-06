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

    // Compiler Performance Evaluation
    const start_time = performance.now();

    const child = exec(command, options, (error, stdout, stderr) => {
      // console.log("executeCommand is earlier here");

      // Checking the performance of Compiler
      const end_time = performance.now();
      console.log(`Time taken: ${end_time - start_time}`);

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

const delete_temp = async (path_temp) => {
  setTimeout(() => {
    try {
      fs.unlinkSync(path_temp);
    } catch {
      console.log("The File to be deleted doesn't exist")
    }
  }, 5000);
}

// executecpp.js
const executecpp = async (filePath, inputFilePath) => {
  const jobId = path.basename(filePath).split(".")[0];
  const outputFilename = `${jobId}.exe`;
  // const outputFilename = `${jobId}.out`;
  const outPath = path.join(outputPath, outputFilename);
  const exedir = path.join(__dirname, `executables`);
  const executable = path.join(exedir, outputFilename);

  const command = `g++ ${filePath} -o ${outPath} && cd ${outputPath} && .\\${outputFilename} < ${inputFilePath}`;
  // const command = `g++ ${filePath} -o ${outPath} && cd ${outputPath} && ./${jobId}.out < ${inputFilePath}`;

  return await executeCommand(command, (timeLimit = 2000), (memoryLimit = 64))
    .then((stdout) => {
      const normalizedOutput = stdout.replace(/\r\n/g, "\n").trim();
      return normalizedOutput;
    })
    .catch((error) => {
      throw error;
    })
    .finally(() => {
      // console.log("Unlink is earlier here");
      delete_temp(inputFilePath);
      delete_temp(executable);
    });
};

// executejava.js
const executejava = async (filePath, inputFilePath) => {
  const command = `java ${filePath} < ${inputFilePath}`;

  return await executeCommand(command, (timeLimit = 2000), (memoryLimit = 64))
  .then((stdout) => {
    const normalizedOutput = stdout.replace(/\r\n/g, "\n").trim();
    return normalizedOutput;
  })
  .catch((error) => {
    throw error;
  })
  .finally(() => {
    delete_temp(inputFilePath);
  });
};

// executePy.js
const executePy = async (filePath, inputFilePath) => {
  const command = `python ${filePath} < ${inputFilePath}`;

  return await executeCommand(command, (timeLimit = 2000), (memoryLimit = 64))
  .then((stdout) => {
    const normalizedOutput = stdout.replace(/\r\n/g, "\n").trim();
    return normalizedOutput;
  })
  .catch((error) => {
    throw error;
  })
  .finally(() => {
    delete_temp(inputFilePath);
  });
};

module.exports = { executecpp, executejava, executePy };
