"use client";

import { Check, Minus } from "lucide-react";
import {
  Checkbox as AriaCheckbox,
  CheckboxGroup as AriaCheckboxGroup,
  composeRenderProps,
  type CheckboxProps as AriaCheckboxProps,
} from "react-aria-components";

import { cn } from "@/lib/utils";
import { labelVariants } from "@/components/ui/field";

const CheckboxGroup = AriaCheckboxGroup;

const Checkbox = ({ className, children, ...props }: AriaCheckboxProps) => (
  <AriaCheckbox
    className={composeRenderProps(className, (className) =>
      cn(
        "group/checkbox flex items-center gap-x-2",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-70",
        labelVariants,
        className
      )
    )}
    {...props}
  >
    {composeRenderProps(children, (children, renderProps) => (
      <>
        <div
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded-sm border border-primary text-current ring-offset-background",
            "group-data-[focus-visible]/checkbox:outline-none group-data-[focus-visible]/checkbox:ring-2 group-data-[focus-visible]/checkbox:ring-ring group-data-[focus-visible]/checkbox:ring-offset-2",
            "group-data-[indeterminate]/checkbox:bg-primary group-data-[selected]/checkbox:bg-primary group-data-[indeterminate]/checkbox:text-primary-foreground group-data-[selected]/checkbox:text-primary-foreground",
            "group-data-[disabled]/checkbox:cursor-not-allowed group-data-[disabled]/checkbox:opacity-50",
            "group-data-[invalid]/checkbox:border-destructive group-data-[invalid]/checkbox:group-data-[selected]/checkbox:bg-destructive group-data-[invalid]/checkbox:group-data-[selected]/checkbox:text-destructive-foreground",
            "focus:outline-none focus-visible:outline-none"
          )}
        >
          {renderProps.isIndeterminate ? (
            <Minus className="size-4" />
          ) : renderProps.isSelected ? (
            <Check className="size-4" />
          ) : null}
        </div>
        {children}
      </>
    ))}
  </AriaCheckbox>
);

export { Checkbox, CheckboxGroup };
