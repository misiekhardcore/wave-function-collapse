export function getCommonOptions(...optionsArrays: (number[] | undefined)[]): number[] {
  const definedOptions = optionsArrays.filter(
    (options): options is number[] => !!options && options?.length > 0
  );
  const results = definedOptions.shift()?.filter((option) => {
    return definedOptions.every((options) => options.indexOf(option) !== -1);
  });
  return results || [];
}
