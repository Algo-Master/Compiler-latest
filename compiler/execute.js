const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const terminate = require("terminate");

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

    const processx = exec(command, options, (error, stdout, stderr) => {
      // Checking the performance of Compiler
      // Time Statistics
      const endTime = process.hrtime(startTime);
      const elapsedTimeMs = endTime[0] * 1000 + endTime[1] / 1e6; // Convert to milliseconds
      console.log(`Time elapsed: ${elapsedTimeMs} ms`);

      // Memory Statistics
      const endMemoryUsage = process.memoryUsage().heapUsed;
      const memoryDifference = (endMemoryUsage - startMemoryUsage) / 1024 / 1024;
      console.log(`Memory used: ${memoryDifference} MB`);

      clearTimeout(timeoutId); // Clear the timeout after execution finishes

      if (error) {
        if (error.killed) {
          console.log("Execution time exceeded the limit");
        }
        return reject(error);
      }
      if (stderr) {
        return reject(stderr);
      }
      // Resolve both output and elapsedTimeMs
      resolve({ output: stdout, elapsedTimeMs, memoryDifference });
    });

    // Checks to ensure if Time Limits are managed well
    const timeoutId = setTimeout(() => {
      console.log(`Child killed -> ${processx.killed}`);
      terminate(processx.pid, function (err) {
        if (err) {
          // you will get an error if you did not supply a valid process.pid
          console.log("Oopsy error faced but process tree killed??"); // handle errors in your preferred way.
        } else {
          console.log("done killing the process"); // terminating the Processes succeeded.
          // NOTE: The above won't be run in this example as the process itself will be killed before.
        }
      });
      return reject("Time Limit Exceeded");
    }, timeLimit);
  });
};

// executecpp
const executecpp = async (
  filePath,
  inputFilePath,
  timeLimit = 2,
  memoryLimit = 64
) => {
  const jobId = path.basename(filePath).split(".")[0];
  // const outputFilename = `${jobId}.exe`;
  const outputFilename = `${jobId}.out`;
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

    // const execfile = path.join(exedir, `.\\${outputFilename}`);
    const execfile = path.join(exedir, `./${outputFilename}`);

    // Execute the compiled code
    const runCommand = `${execfile} < ${inputFilePath}`;
    // const runcommand = `./${jobId}.out < ${inputFilePath}`;
    const { output, elapsedTimeMs, memoryDifference } = await executeCommand(
      runCommand,
      timeLimit * 1000,
      memoryLimit
    );

    const normalizedOutput = output.replace(/\r\n/g, "\n").trim();

    // Return both normalizedOutput and elapsedTimeMs
    return { output: normalizedOutput, elapsedTimeMs, memoryDifference };
  } catch (error) {
    throw error;
  }
};

// executejava
const executejava = async (
  filePath,
  inputFilePath,
  timeLimit = 4000,
  memoryLimit = 64
) => {
  try {
    const command = `java ${filePath} < ${inputFilePath}`;

    const { output, elapsedTimeMs, memoryDifference } = await executeCommand(
      command,
      4000,
      memoryLimit
    );

    const normalizedOutput = output.replace(/\r\n/g, "\n").trim();

    // Return both normalizedOutput and elapsedTimeMs
    return { output: normalizedOutput, elapsedTimeMs, memoryDifference };
  } catch (error) {
    throw error;
  }
};

// executePy
const executePy = async (
  filePath,
  inputFilePath,
  timeLimit = 4000,
  memoryLimit = 64
) => {
  try {
    const command = `python ${filePath} < ${inputFilePath}`;

    const { output, elapsedTimeMs, memoryDifference } = await executeCommand(
      command,
      4000,
      memoryLimit
    );
    
    const normalizedOutput = output.replace(/\r\n/g, "\n").trim();

    // Return both normalizedOutput and elapsedTimeMs
    return { output: normalizedOutput, elapsedTimeMs, memoryDifference };
  } catch (error) {
    throw error;
  }
};

module.exports = { executecpp, executejava, executePy, executeCommand };
