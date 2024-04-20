export function getCommonOptions(...optionsArrays: (number[] | undefined)[]): number[] {
  const definedOptions = optionsArrays.filter(
    (options): options is number[] => !!options && options?.length > 0
  );
  const results: number[] = [];

  definedOptions[0]?.forEach((option) => {
    if (definedOptions.every((options) => options.includes(option))) {
      results.push(option);
    }
  });
  return results;
}
