import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

// A simplified, robust Select for the dashboard
export const Select = ({ value, onValueChange, children }: any) => {
  // We extract the items from SelectContent -> SelectItem
  const content = React.Children.toArray(children).find(
    (c: any) => c.type?.displayName === "SelectContent" || c.type === SelectContent
  ) as any;

  const items = content?.props?.children ? React.Children.toArray(content.props.children) : [];

  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn(
          "flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "pr-10" // space for the icon
        )}
      >
        {items.map((item: any, idx) => {
          if (!React.isValidElement(item)) return null;
          return (
            <option key={idx} value={(item.props as any).value}>
              {(item.props as any).children}
            </option>
          );
        })}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
  )
}

export const SelectTrigger = ({ children, className }: any) => null // Not needed for functional select
export const SelectValue = ({ placeholder }: any) => null // Not needed for functional select
export const SelectContent = ({ children }: any) => children
SelectContent.displayName = "SelectContent"

export const SelectItem = ({ children, value }: any) => null // Just a data container
