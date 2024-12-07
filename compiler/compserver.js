const express = require("express");
const app = express();
const { DBConnection } = require("./database/db");
const Problem = require("./models/Problem");
const { generateInputFile } = require("./generateInputFile");
const { authenticate } = require("./auth");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const corsOptions = {
  origin: ["https://algohub-nu.vercel.app", "https://algohub7.vercel.app"], // Replace with your frontend origin
  // origin: "http://localhost:5173",
  credentials: true, // Include cookies if necessary
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  methods: 'GET, POST, PUT, DELETE, OPTIONS', // Allowed HTTP methods
  // maxAge: 3600, // How long (in seconds) the options preflight request can be cached
};

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

DBConnection();

const dotenv = require("dotenv");
dotenv.config();

const { generateFile } = require("./generateFile");
const { executecpp, executejava, executePy } = require("./execute");

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

app.get("/", (req, res) => {
  res.json({
    OS: "Running on Linux Server",
    Compilers_supported: "g++, JAVA 21, python3",
  });
});

app.post("/run", async (req, res) => {
  const token = req.cookies?.token;
  const { language = "C++", code, manualTestCase: input } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, error: "Code not found" });
  }
  if (!input) {
    return res.status(400).json({ success: false, error: "Input not found" });
  }
  if (!token) {
    return res
      .status(400)
      .json({ success: false, error: "Unauthorized access" });
  }

  // Checks if token is found
  console.log("Token found successfully");

  const verified = authenticate(token);
  switch (verified) {
    case 0:
      return res.status(400).json({ error: "Token tampered" });
    case 2:
      return res
        .status(400)
        .json({ error: "Token expired!! Please log in again." });
  }

  try {
    // Create a file using {lang, code}
    const filePath = await generateFile(language, code);
    //Create a file for CustomInput
    const inputFilePath = await generateInputFile(input, filePath);

    let result;
    switch (language) {
      case "C++":
        result = await executecpp(filePath, inputFilePath);
        break;
      case "Java":
        result = await executejava(filePath, inputFilePath);
        break;
      case "Python3":
        result = await executePy(filePath, inputFilePath);
        break;
      default:
        return res
          .status(400)
          .json({ success: false, error: "Unsupported language" });
    }

    const { output, elapsedTimeMs, memoryDifference } = result;

    // Clear away the temporary files
    // await delete_temp(filePath, 2000);
    // await delete_temp(inputFilePath, 2000);

    res.status(200).json({
      success: true,
      output,
      elapsedTimeMs,
      memoryOcc: memoryDifference,
    });
  } catch (error) {
    // await delete_temp(filePath, 2000);
    // await delete_temp(inputFilePath, 2000);

    // Always send 200 status with error messages for frontend understanding
    res.status(400).json({ success: false, message: error });
  }
});

app.post("/submit", async (req, res) => {
  const token = req.cookies?.token;
  const { language = "C++", code, problemId } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, error: "Code not found" });
  }
  if (!token) {
    return res
      .status(400)
      .json({ success: false, error: "Unauthorized access" });
  }

  const verified = authenticate(token);
  switch (verified) {
    case 0:
      return res.status(400).json({ error: "Token tampered" });
    case 2:
      return res
        .status(400)
        .json({ error: "Token expired!! Please log in again." });
  }

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res
        .status(400)
        .json({ success: false, error: "Problem not found" });
    }

    const filePath = await generateFile(language, code);

    let totalElapsedTime = 0; // To keep track of total execution time
    let totalMemoryUsed = 0; // To keep track of total memory

    for (const testcase of problem.testcases) {
      const inputFilePath = await generateInputFile(
        testcase.testinput,
        filePath
      );

      try {
        let result;
        switch (language) {
          case "C++":
            result = await executecpp(
              filePath,
              inputFilePath,
              problem.timel,
              problem.meml
            );
            break;
          case "Java":
            result = await executejava(
              filePath,
              inputFilePath,
              problem.timel,
              problem.meml
            );
            break;
          case "Python3":
            result = await executePy(
              filePath,
              inputFilePath,
              problem.timel,
              problem.meml
            );
            break;
          default:
            return res
              .status(400)
              .json({ success: false, error: "Unsupported language" });
        }

        const { output, elapsedTimeMs, memoryDifference } = result;

        // Normalize and compare output
        const cleanedOutput = output.trim();
        const expectedOutput = testcase.testoutput
          .replace(/\r\n/g, "\n")
          .trim();

        if (cleanedOutput !== expectedOutput) {
          return res.status(400).json({
            success: false,
            verdict: "Wrong Answer",
            failedTestCase: testcase.testinput,
          });
        }

        // Add the execution time for this test case to the total
        totalElapsedTime += elapsedTimeMs;
        totalMemoryUsed += memoryDifference;
      } catch (error) {
        // Handle specific errors
        let status = 400;

        return res.status(status).json({
          success: false,
          error: error,
          verdict: "Failed",
          failedTestCase: testcase.testinput,
        });
      }
    }

    return res.status(200).json({
      success: true,
      verdict: "Accepted",
      output: "Accepted",
      elapsedTime: totalElapsedTime,
      memoryOcc: totalMemoryUsed,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error });
  }
});

// Compiler Server.js
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server listening on Port: ${PORT}!!`);
});
