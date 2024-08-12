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
    const startTime = process.hrtime();
    const startMemoryUsage = process.memoryUsage().heapUsed;

    const child = exec(command, options, (error, stdout, stderr) => {
      // console.log("executeCommand is earlier here");

      // Checking the performance of Compiler
      // Time Statistics
      const endTime = process.hrtime(startTime);
      const elapsedTimeMs = endTime[0] * 1000 + endTime[1] / 1e6; // Convert to milliseconds
      console.log(`Time elapsed: ${elapsedTimeMs} ms`);

      // Memory Usage
      const endMemoryUsage = process.memoryUsage().heapUsed;
      const memoryDifference = endMemoryUsage - startMemoryUsage;
      console.log(`Memory used: ${memoryDifference / 1024 / 1024} MB`);

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

    // setTimeout(() => {
    //   try {
    //     console.log("Trying to kill the Child_Process!!");
    //     child.kill();
    //   } catch {
    //     console.log("Child_Process is not getting killed!!");
    //   }
    // }, timeLimit);

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

const delete_temp = async (path_temp, del_time) => {
  setTimeout(() => {
    try {
      fs.unlinkSync(path_temp);
    } catch {
      console.log(
        "The File to be deleted doesn't exist or is busy getting executed!!"
      );
    }
  }, del_time);
};

// executecpp.js
const executecpp = async (
  filePath,
  inputFilePath,
  timeLimit = 4000,
  memoryLimit = 64
) => {
  const jobId = path.basename(filePath).split(".")[0];
  const outputFilename = `${jobId}.exe`;
  // const outputFilename = `${jobId}.out`;
  const outPath = path.join(outputPath, outputFilename);
  const exedir = path.join(__dirname, `executables`);
  const executable = path.join(exedir, outputFilename);

  // Compile the code
  const compileCommand = `g++ ${filePath} -o ${outPath}`;

  try {
    await new Promise((resolve, reject) => {
      exec(compileCommand, (error, stdout, stderr) => {
        if (error) {
          return reject(`Compilation error: ${stderr}`);
        }
        resolve(stdout);
      });
    });

    const execfile = path.join(exedir, `.\\${outputFilename}`);

    // Execute the compiled code
    // const runCommand = `cd ${outputPath} && .\\${outputFilename} < ${inputFilePath}`;
    const runCommand = `${execfile} < ${inputFilePath}`;
    // const runcommand = `./${jobId}.out < ${inputFilePath}`;
    const output = await executeCommand(runCommand, timeLimit, memoryLimit);

    const normalizedOutput = output.replace(/\r\n/g, "\n").trim();
    return normalizedOutput;
  } catch (error) {
    throw error;
  } finally {
    // Clean up temporary files
    delete_temp(inputFilePath, timeLimit + 1000);
    delete_temp(executable, timeLimit + 1000);
  }
};

// executejava.js
const executejava = async (
  filePath,
  inputFilePath,
  timeLimit = 4000,
  memoryLimit = 64
) => {
  const command = `java ${filePath} < ${inputFilePath}`;

  await executeCommand(command, timeLimit, memoryLimit)
    .then((stdout) => {
      const normalizedOutput = stdout.replace(/\r\n/g, "\n").trim();
      return normalizedOutput;
    })
    .catch((error) => {
      throw error;
    })
    .finally(() => {
      delete_temp(inputFilePath, timeLimit + 1000);
    });
};

// executePy.js
const executePy = async (
  filePath,
  inputFilePath,
  timeLimit = 4000,
  memoryLimit = 64
) => {
  const command = `python ${filePath} < ${inputFilePath}`;

  await executeCommand(command, timeLimit, memoryLimit)
    .then((stdout) => {
      const normalizedOutput = stdout.replace(/\r\n/g, "\n").trim();
      return normalizedOutput;
    })
    .catch((error) => {
      throw error;
    })
    .finally(() => {
      delete_temp(inputFilePath, timeLimit + 1000);
    });
};

module.exports = { executecpp, executejava, executePy };
