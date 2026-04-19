export const toastMessages = {
  lockedRemove: {
    batchTitleOne: () => "That module is locked and wasn't removed.",
    batchTitleMany: (count: number) => `${count} locked modules weren't removed.`,
    batchDescription: () => "Unlock a module from its ⋮ menu to remove it.",
    directTitle: () => "Can't remove a locked module.",
    directDescription: (moduleName: string) =>
      `Unlock ${moduleName} from its menu first.`,
  },
};
