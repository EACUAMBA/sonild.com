import {CalendarDays, ChevronLeft, ChevronRight} from 'lucide-react';
import {useMemo, useState} from 'react';
import SelectField from '@/components/backoffice/SelectField';

type Props = { value: string; onChange: (value: string) => void; placeholder?: string };
const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const pad = (value: number) => String(value).padStart(2, '0');

function parseValue(value: string) {
    const date = value ? new Date(value) : new Date();
    return Number.isNaN(date.getTime()) ? new Date() : date;
}

function dateValue(date: Date, time: string) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${time || '15:00'}`;
}

export default function DatePicker({value, onChange, placeholder = 'Selecionar data e hora'}: Props) {
    const selected = parseValue(value);
    const [open, setOpen] = useState(false);
    const [month, setMonth] = useState(selected.getMonth());
    const [year, setYear] = useState(selected.getFullYear());
    const time = value.includes('T') ? value.split('T')[1].slice(0, 5) : '15:00';
    const years = useMemo(() => Array.from({length: 61}, (_, index) => String(new Date().getFullYear() - 30 + index)), []);
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
    const days = new Date(year, month + 1, 0).getDate();
    const cells = [...Array(firstDay).fill(null), ...Array.from({length: days}, (_, index) => index + 1)];
    const isSelected = (day: number) => value && selected.getFullYear() === year && selected.getMonth() === month && selected.getDate() === day;
    const chooseDay = (day: number) => {
        const next = new Date(year, month, day);
        onChange(dateValue(next, time));
    };
    const changeMonth = (direction: number) => {
        const next = new Date(year, month + direction, 1);
        setMonth(next.getMonth());
        setYear(next.getFullYear());
    };
    const display = value ? new Intl.DateTimeFormat('pt-PT', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(selected) : placeholder;

    return <div className="relative">
        <button type="button"
                className={`field-input flex min-h-10 w-full items-center justify-between gap-3 text-left ${!value ? 'text-muted-foreground' : ''}`}
                onClick={() => setOpen((current) => !current)} aria-expanded={open}><span
            className="truncate">{display}</span><CalendarDays className="size-4 shrink-0 text-muted-foreground"/>
        </button>
        {open && <div
            className="absolute left-0 top-[calc(100%+8px)] z-[60] w-[min(22rem,calc(100vw-2rem))] rounded-xl border bg-popover p-4 text-popover-foreground shadow-xl">
            <div className="flex items-center gap-2">
                <button type="button" className="rounded-md p-2 hover:bg-muted" onClick={() => changeMonth(-1)}
                        aria-label="Mês anterior"><ChevronLeft className="size-4"/></button>
                <div className="grid flex-1 grid-cols-2 gap-2"><SelectField value={String(month)}
                                                                            onChange={(next) => setMonth(Number(next))}
                                                                            options={monthNames.map((label, index) => ({
                                                                                label,
                                                                                value: String(index)
                                                                            }))}/><SelectField value={String(year)}
                                                                                               onChange={(next) => setYear(Number(next))}
                                                                                               options={years.map((item) => ({
                                                                                                   label: item,
                                                                                                   value: item
                                                                                               }))}/></div>
                <button type="button" className="rounded-md p-2 hover:bg-muted" onClick={() => changeMonth(1)}
                        aria-label="Mês seguinte"><ChevronRight className="size-4"/></button>
            </div>
            <div
                className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">{weekDays.map((day) =>
                <span key={day} className="py-1 font-medium">{day}</span>)}{cells.map((day, index) => day ?
                <button type="button" key={day}
                        className={`rounded-md py-2 text-sm transition hover:bg-accent hover:text-accent-foreground ${isSelected(day) ? 'bg-primary text-primary-foreground hover:bg-primary' : ''}`}
                        onClick={() => chooseDay(day)}>{day}</button> : <span key={`empty-${index}`}/>)}</div>
            <div className="mt-4 border-t pt-3"><label className="field-label text-xs">Hora<input
                className="field-input mt-1" type="time" value={time} onChange={(event) => {
                const next = new Date(year, month, selected.getDate());
                onChange(dateValue(next, event.target.value));
            }}/></label>
                <button type="button"
                        className="mt-3 w-full rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
                        onClick={() => setOpen(false)}>Concluir
                </button>
            </div>
        </div>}</div>;
}
