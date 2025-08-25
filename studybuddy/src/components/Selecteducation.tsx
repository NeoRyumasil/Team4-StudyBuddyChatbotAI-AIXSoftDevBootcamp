import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from './ui/select';

interface SelectEducationProps {
  value: string;
  onChange: (level: string) => void;
}

export function SelectEducation({ value, onChange }: SelectEducationProps) {
  return (
    <div className="min-w-[160px]">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className={`w-full border-blue-300 ${
            value === 'Unknown'
              ? 'bg-blue-50 text-blue-400'
              : 'bg-blue-50 text-blue-900'
          }`}
          aria-label="Select education level"
        >
          <SelectValue placeholder="Select Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Unknown" disabled>Unknown</SelectItem>
          <SelectItem value="Elementary">Elementary</SelectItem>
          <SelectItem value="Middle School">Middle School</SelectItem>
          <SelectItem value="High School">High School</SelectItem>
          <SelectItem value="College">College</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}