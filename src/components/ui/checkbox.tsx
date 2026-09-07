"use client"

import * as React from "react"
import { Controller, Control, ControllerProps, FieldPath, FieldValues, useFormContext } from "react-hook-form"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const checkboxVariants = cva(
  "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-primary checked:text-primary-foreground",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, onChange, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn(checkboxVariants(), className)}
      onChange={(event) => {
        onChange?.(event)
        onCheckedChange?.(event.target.checked)
      }}
      {...props}
    />
  )
)
Checkbox.displayName = "Checkbox"

type CheckboxFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
  control?: Control<TFieldValues>
  rules?: ControllerProps<TFieldValues, TName>["rules"]
  defaultValue?: ControllerProps<TFieldValues, TName>["defaultValue"]
} & Omit<CheckboxProps, "checked" | "defaultChecked" | "onCheckedChange" | "value" | "defaultValue">

export function CheckboxField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control,
  rules,
  defaultValue,
  ...props
}: CheckboxFieldProps<TFieldValues, TName>) {
  const context = useFormContext<TFieldValues>()
  const ctrl = control ?? context?.control

  return (
    <Controller
      name={name}
      control={ctrl}
      defaultValue={defaultValue as ControllerProps<TFieldValues, TName>["defaultValue"]}
      rules={rules}
      render={({
        field: { value = false, ...field },
        fieldState: { error },
      }) => (
        <div>
          <Checkbox
            checked={value}
            onCheckedChange={(checked: boolean) => {
              field.onChange(checked)
            }}
            aria-invalid={!!error}
            aria-describedby={`${name}-error`}
            {...props}
          />
          {error && (
            <p
              role="alert"
              id={`${name}-error`}
              className="text-destructive text-xs mt-1"
              aria-live="assertive"
            >
              {error.message}
            </p>
          )}
        </div>
      )}
    />
  )
}

export { Checkbox, checkboxVariants }

