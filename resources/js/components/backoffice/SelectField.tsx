import {Select} from 'antd';

type Option = { label: string; value: string };
type Props = {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    disabled?: boolean
};

export default function SelectField({value, onChange, options, placeholder = 'Selecionar', disabled = false}: Props) {
    return <Select className="w-full" value={value || undefined} onChange={onChange} options={options}
                   placeholder={placeholder} disabled={disabled} showSearch optionFilterProp="label"/>;
}
