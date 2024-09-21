const { executeCommand, executecpp } = require("../execute");

// test("No Input", async () => {
//   const result = await executeCommand(
//     "o:\\Web_DeV\\Compiler_latest\\compiler\\test\\cpp_test\\Without_Input.exe < O:\\Web_DeV\\Compiler_latest\\compiler\\test\\cpp_test\\no_inp.txt",
//     1000,
//     50
//   );
//   expect(result.trim()).toBe("10001"); // Assuming your result might have newlines, trimming it
// });

// test("Infinite Loop", async () => {
// const result = await executeCommand(
//   "o:\\Web_DeV\\Compiler_latest\\compiler\\test\\cpp_test\\Infinite_Loop.exe < O:\\Web_DeV\\Compiler_latest\\compiler\\test\\cpp_test\\no_inp.txt",
//   4000,
//   50
// );
// expect(result.trim()).toBe("Time Limit Exceeded");
// });

// test("Input", async () => {
//   const result = await executeCommand(
//     "o:\\Web_DeV\\Compiler_latest\\compiler\\test\\cpp_test\\sum.exe < O:\\Web_DeV\\Compiler_latest\\compiler\\test\\cpp_test\\input.txt",
//     1000,
//     50
//   );
//   // Log the raw result to inspect the differences if needed
//   console.log("Raw result: ", result);

//   // Normalize newlines and trim extra whitespace
//   const normalizedResult = result.replace(/\r\n/g, "\n").trim();

//   // Now compare the result with your expected value
//   expect(normalizedResult).toBe("11\n69\n1102");
// });

test("executecpp testing", async () => {
  // const result = await executecpp(
  //   "O:\\Web_DeV\\Compiler_latest\\compiler\\test\\cpp_test\\sum.cpp",
  //   "O:\\Web_DeV\\Compiler_latest\\compiler\\test\\cpp_test\\input.txt",
  //   2
  // );
  // // Log the raw result to inspect the differences if needed
  // console.log("Raw result: ", result);

  // // Normalize newlines and trim extra whitespace
  // const normalizedResult = result.replace(/\r\n/g, "\n").trim();

  // // Now compare the result with your expected value
  // expect(normalizedResult).toBe("11\n69\n1102");


  const result_inf = await executecpp(
    "O:\\Web_DeV\\Compiler_latest\\compiler\\test\\cpp_test\\Infinite_Loop.cpp",
    "O:\\Web_DeV\\Compiler_latest\\compiler\\test\\cpp_test\\input.txt",
    2,
    50
  );
  expect(result_inf.trim()).toBe("Time Limit Exceeded");
});
