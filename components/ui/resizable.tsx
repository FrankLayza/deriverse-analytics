"use client";

import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
// This component is not currently used in the application
// TODO: Either remove this component or upgrade react-resizable-panels if needed

// For now, creating placeholder exports to prevent build errors
const ResizablePanelGroup = ({ className, ...props }: any) => {
  return <div className={cn("flex h-full w-full", className)} {...props} />;
};

const ResizablePanel = ({ className, children, ...props }: any) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

const ResizableHandle = ({ withHandle, className, ...props }: any) => {
  return (
    <div
      className={cn(
        "relative flex w-px items-center justify-center bg-border",
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
};

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
