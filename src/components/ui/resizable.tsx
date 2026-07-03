import { GripVertical } from "lucide-react";

import { cn } from "@/lib/utils";

// Placeholder components for resizable panels
// The actual react-resizable-panels API may differ from expectations

const ResizablePanelGroup = ({ className, children, ...props }: any) => (
  <div
    className={cn("flex h-full w-full", className)}
    {...props}
  >
    {children}
  </div>
);

const ResizablePanel = ({ children, ...props }: any) => (
  <div {...props}>
    {children}
  </div>
);

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: any) => (
  <div
    className={cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2",
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </div>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
