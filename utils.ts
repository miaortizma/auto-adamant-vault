import readline from "readline";

const createInterface = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  async function input(question): Promise<string> {
    return new Promise((resolve) => {
      rl.question(question, resolve);
    });
  }

  return { rl, input };
};

export default createInterface;
