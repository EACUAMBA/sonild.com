import {DatePicker as AntDatePicker} from 'antd';
import dayjs from 'dayjs';

type Props = { value: string; onChange: (value: string) => void; placeholder?: string };

export default function DatePicker({value, onChange, placeholder = 'Selecionar data e hora'}: Props) {
    return <AntDatePicker className="w-full" value={value ? dayjs(value) : null}
                          onChange={(date) => onChange(date ? date.format('YYYY-MM-DDTHH:mm') : '')}
                          showTime={{format: 'HH:mm'}} format="DD/MM/YYYY HH:mm" placeholder={placeholder}
                          showNow={false}/>;
}
