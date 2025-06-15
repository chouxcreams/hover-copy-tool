// Additional type definitions for Chrome Extension APIs
// This extends the existing @types/chrome package

declare namespace chrome {
  namespace storage {
    interface StorageChange {
      oldValue?: unknown;
      newValue?: unknown;
    }

    interface StorageChangedEvent {
      addListener(
        callback: (
          changes: { [key: string]: StorageChange },
          areaName: string
        ) => void
      ): void;
      removeListener(
        callback: (
          changes: { [key: string]: StorageChange },
          areaName: string
        ) => void
      ): void;
    }

    const onChanged: StorageChangedEvent;
  }
}
