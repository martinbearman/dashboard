import raw from "./toast.properties";
import { parseProperties } from "./parseProperties";

const p = parseProperties(raw);

export const toastMessages = {
  lockedRemove: {
    batchTitleOne: () => p["locked.remove.batch.title.one"]!,
    batchTitleMany: (count: number) =>
      p["locked.remove.batch.title.many.pattern"]!.replace("{0}", String(count)),
    batchDescription: () => p["locked.remove.batch.description"]!,
    directTitle: () => p["locked.remove.direct.title"]!,
    directDescription: (moduleName: string) =>
      p["locked.remove.direct.description.pattern"]!.replace("{0}", moduleName),
  },
};
