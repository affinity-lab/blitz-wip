export const scopeEnum = (enm: any, prepend: string) => {for (const enmKey in enm) enm[enmKey] = prepend + ":" + enm[enmKey];};
