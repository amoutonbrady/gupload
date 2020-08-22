export const parseEnv = <T, K extends keyof T>(defaultValues: T) => {
  const env: Partial<T> = {};

  for (const [key, value] of Object.entries(defaultValues)) {
    const valueFromEnv: K | undefined =
      typeof value === "string"
        ? process.env[key] || ""
        : JSON.parse(process.env[key] || "");
    env[key as K] = valueFromEnv || value;
  }

  return env as Required<T>;
};
