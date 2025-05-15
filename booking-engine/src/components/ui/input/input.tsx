import Item from "antd/es/list/Item";
import React from "react";
import { Input } from "@nextui-org/react";

type InputProps = {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  required?: boolean;
  maxLength?: number;
};

const InputFields: React.FC<InputProps> = ({
  label,
  type,
  value,
  onChange,
  className,
  required,
  maxLength,
}) => {
  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
        <Input
          type={type}
          variant="underlined"
          label={label}
          value={value}
          onChange={onChange}
          className={className}
          required={required}
          maxLength={maxLength}
        />
      </div>
    </div>
  );
};

export default InputFields;