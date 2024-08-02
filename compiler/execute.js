const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const outputPath = path.join(__dirname, "executables");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

// executecpp.js
const executecpp = (filePath, inputFilePath) => {
  const jobId = path.basename(filePath).split(".")[0];
  const outputFilename = `${jobId}.out`;
  const outPath = path.join(outputPath, outputFilename);
  const exedir = path.join(__dirname, `executables`);
  const executable = path.join(exedir, outputFilename);

  return new Promise((resolve, reject) => {
    exec(
      // `g++ ${filePath} -o ${outPath} && cd ${outputPath} && .\\${outputFilename} < ${inputFilePath}`,
      `g++ ${filePath} -o ${outPath} && cd ${outputPath} && ./${jobId}.out < ${inputFilePath}`,
      (error, stdout, stderr) => {
        fs.unlinkSync(executable);
        fs.unlinkSync(inputFilePath);
        if (error) reject(error);
        else if (stderr) reject(stderr);
        else {
          // Normalize line endings to '\n'
          const normalizedOutput = stdout.replace(/\r\n/g, "\n").trim();
          resolve(normalizedOutput);
        }
      }
    );
  });
};

// executejava.js
const executejava = (filePath, inputFilePath) => {
  // const jobId = path.basename(filePath).split(".")[0];
  // const outputFilename = `${jobId}.java`;

  return new Promise((resolve, reject) => {
    exec(`java ${filePath} < ${inputFilePath}`, (error, stdout, stderr) => {
      fs.unlinkSync(inputFilePath);
      if (error) {
        reject(error);
      }
      if (stderr) {
        reject(stderr);
      }
      // Normalize line endings to '\n'
      const normalizedOutput = stdout.replace(/\r\n/g, "\n").trim();
      resolve(normalizedOutput);
    });
  });
};

// executePy.js
const executePy = (filePath, inputFilePath) => {
  console.log(`python ${filePath} < ${inputFilePath}`);

  return new Promise((resolve, reject) => {
    exec(`python ${filePath} < ${inputFilePath}`, (error, stdout, stderr) => {
      fs.unlinkSync(inputFilePath);
      if (error) reject(error);
      else if (stderr) reject(stderr);
      else {
        const normalizedOutput = stdout.replace(/\r\n/g, "\n").trim();
        resolve(normalizedOutput);
      }
    });
  });
};

module.exports = { executecpp, executejava, executePy };
