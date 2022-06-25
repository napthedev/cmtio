export const idFromRef = (ref: any) =>
  JSON.parse(JSON.stringify(ref))["@ref"]["id"];
