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
      const memoryDifference = endMemoryUsage - startMemoryUsage;
      console.log(`Memory used: ${memoryDifference / 1024 / 1024} MB`);

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
      resolve(stdout);
    });

    // Checks to ensure if Time Limits are managed well
    const timeoutId = setTimeout(() => {
      console.log(`Child killed -> ${processx.killed}`);
      const endTime = process.hrtime(startTime);
      const elapsedTimeMs = endTime[0] * 1000 + endTime[1] / 1e6; // Convert to milliseconds
      console.log(`Time elapsed from timeoutId: ${elapsedTimeMs} ms`);
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

// async function myAsyncFunction() {
//   try {
//     const result = await executeCommand(
//       "o:\\Web_DeV\\Compiler_latest\\compiler\\test\\cpp_test\\sum.exe < O:\\Web_DeV\\Compiler_latest\\compiler\\test\\cpp_test\\input.txt",
//       1000,
//       50
//     );
//     console.log(result);
//   } catch (error) {
//     console.error("Error:", error);
//   }
// }

// myAsyncFunction();

const delete_temp = async (path_temp, del_time) => {
  setTimeout(() => {
    try {
      fs.unlinkSync(path_temp);
    } catch {
      console.log(
        `The File ${path_temp} to be deleted doesn't exist or is busy getting executed!!`
      );
    }
  }, del_time);
};

// executecpp.js
const executecpp = async (
  filePath,
  inputFilePath,
  timeLimit = 2,
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
    // const execfile = path.join(exedir, `./${outputFilename}`);

    // Execute the compiled code
    const runCommand = `${execfile} < ${inputFilePath}`;
    // const runcommand = `./${jobId}.out < ${inputFilePath}`;
    const output = await executeCommand(
      runCommand,
      timeLimit * 1000,
      memoryLimit
    );

    // Clean up temporary files
    delete_temp(inputFilePath, 0);
    delete_temp(executable, 0);

    const normalizedOutput = output.replace(/\r\n/g, "\n").trim();
    return normalizedOutput;
  } catch (error) {

    delete_temp(inputFilePath, 500);
    delete_temp(executable, 500);
    throw error;
  }
};

// // executejava.js
// const executejava = async (
//   filePath,
//   inputFilePath,
//   timeLimit = 4000,
//   memoryLimit = 64
// ) => {
//   const command = `java ${filePath} < ${inputFilePath}`;

//   await executeCommand(command, timeLimit, memoryLimit)
//     .then((stdout) => {
//       const normalizedOutput = stdout.replace(/\r\n/g, "\n").trim();
//       return normalizedOutput;
//     })
//     .catch((error) => {
//       throw error;
//     })
//     .finally(() => {
//       // delete_temp(inputFilePath, timeLimit + 100);
//     });
// };

// // executePy.js
// const executePy = async (
//   filePath,
//   inputFilePath,
//   timeLimit = 4000,
//   memoryLimit = 64
// ) => {
//   const command = `python ${filePath} < ${inputFilePath}`;

//   await executeCommand(command, timeLimit, memoryLimit)
//     .then((stdout) => {
//       const normalizedOutput = stdout.replace(/\r\n/g, "\n").trim();
//       return normalizedOutput;
//     })
//     .catch((error) => {
//       throw error;
//     })
//     .finally(() => {
//       // delete_temp(inputFilePath, timeLimit + 100);
//     });
// };

module.exports = { executecpp, executeCommand };
