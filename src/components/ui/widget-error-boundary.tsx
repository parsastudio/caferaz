"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEFAULT_SITE_CONTENT } from "@/lib/content/default-content";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
}

export class WidgetErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Widget Error Boundary caught an error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-stone-900/30 border border-stone-850 rounded-2xl p-6 text-center space-y-3 my-4">
          <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-stone-300">
            {this.props.fallbackTitle ||
              DEFAULT_SITE_CONTENT.error.widgetErrorDefault}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={this.handleReset}
            className="text-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 ml-1.5" />
            {DEFAULT_SITE_CONTENT.error.widgetErrorRetry}
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
