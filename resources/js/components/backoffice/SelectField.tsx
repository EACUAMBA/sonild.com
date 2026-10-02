import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';

type Option = { label: string; value: string };
type Props = {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    disabled?: boolean
};

export default function SelectField({value, onChange, options, placeholder = 'Selecionar', disabled = false}: Props) {
    return <Select value={value || undefined} onValueChange={onChange} disabled={disabled}><SelectTrigger
        className="field-input h-auto min-h-10 w-full bg-background"><SelectValue
        placeholder={placeholder}/></SelectTrigger><SelectContent>{options.map((option) => <SelectItem
        key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>;
}
