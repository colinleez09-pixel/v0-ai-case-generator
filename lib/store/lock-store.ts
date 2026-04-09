import { create } from "zustand";

interface LockInfo {
  assetId: string;
  assetType: "step" | "component" | "blueprint";
  lockedBy: string;
  lockedByName: string;
  lockedAt: string;
}

interface LockState {
  locks: LockInfo[];
  addLock: (lock: LockInfo) => void;
  removeLock: (assetId: string) => void;
  isLocked: (assetId: string) => boolean;
  getLockInfo: (assetId: string) => LockInfo | undefined;
}

export const useLockStore = create<LockState>((set, get) => ({
  locks: [],
  addLock: (lock) =>
    set((state) => ({
      locks: [...state.locks.filter((l) => l.assetId !== lock.assetId), lock],
    })),
  removeLock: (assetId) =>
    set((state) => ({
      locks: state.locks.filter((l) => l.assetId !== assetId),
    })),
  isLocked: (assetId) => get().locks.some((l) => l.assetId === assetId),
  getLockInfo: (assetId) => get().locks.find((l) => l.assetId === assetId),
}));
