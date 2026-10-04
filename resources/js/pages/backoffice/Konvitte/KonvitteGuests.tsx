import KonvitteManagement, {type KonvitteManagementProps} from '@/components/backoffice/Konvitte/KonvitteManagement';

export default function KonvitteGuests(props: KonvitteManagementProps) {
    return <KonvitteManagement key={props.invitation?.id ?? 'empty'} {...props} section="guests"/>;
}
