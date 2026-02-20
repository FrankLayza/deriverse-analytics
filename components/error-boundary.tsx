"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-100 p-8 text-center border-2 border-dashed border-border rounded-2xl bg-muted/30">
            <div className="p-4 bg-destructive/10 rounded-full mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-6 max-w-xs">
              This specific section failed to load. The rest of your dashboard may still work.
            </p>
            <Button 
              variant="outline" 
              onClick={() => this.setState({ hasError: false })}
              className="gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Try to Reload Section
            </Button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}