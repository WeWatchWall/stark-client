export const delayMillis = (delayMs: number): Promise<void> => new Promise(resolve => setTimeout(resolve, delayMs));

export const greet = (name: string): string => `Hello ${name}`

export const Main = async (): Promise<void> => {
  console.log(greet('World'));
  await delayMillis(1000);
  console.log('done');
}
