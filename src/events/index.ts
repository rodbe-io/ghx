import process from 'node:process';

interface Key {
  name: string;
}

export const initEvents = () => {
  process.stdin.on('keypress', (_, key: Key) => {
    if (key.name === 'escape') {
      console.log('👋 until next time!');
      process.exit(0);
    }
  });

  process.on('uncaughtException', error => {
    if (error instanceof Error && error.name === 'ExitPromptError') {
      console.log('👋 until next time!');
    } else {
      throw error;
    }
  });
};
