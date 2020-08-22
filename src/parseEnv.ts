export const parseEnv = <T, K extends keyof T>(defaultValues: T) => {
  const env: Partial<T> = {};

  for (const [key, value] of Object.entries(defaultValues)) {
    const valueFromEnv = process.env[key] as K | undefined;

    const parsedValue: K = !valueFromEnv
      ? value
      : typeof value === "string"
      ? valueFromEnv
      : JSON.parse(String(valueFromEnv));

    env[key as K] = parsedValue || value;
  }

  return env as Required<T>;
};
