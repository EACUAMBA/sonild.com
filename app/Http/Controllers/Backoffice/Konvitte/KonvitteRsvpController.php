<?php

namespace App\Http\Controllers\Backoffice\Konvitte;

use App\Http\Controllers\Controller;
use App\Models\Konvitte\KonvitteInvitation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KonvitteRsvpController extends Controller
{
    public function index(Request $request, ?KonvitteInvitation $invitation = null): Response
    {
        abort_unless($request->user()?->hasModulePermission('backoffice', 'ACL'), 403);
        $invitation ??= KonvitteInvitation::latest('id')->first();
        $status = $request->query('status');
        $search = $request->query('search', '');
        abort_unless($status === null || in_array($status, ['CONFIRMED', 'DECLINED', 'PENDING', 'UNANSWERED'], true), 400);
        abort_unless(is_string($search) && mb_strlen($search) <= 120, 400);
        $search = trim($search);
        $summary = ['total' => 0, 'confirmed' => 0, 'declined' => 0, 'pending' => 0, 'unanswered' => 0];
        $responses = ['data' => [], 'current_page' => 1, 'last_page' => 1, 'total' => 0];

        if ($invitation) {
            $summary['total'] = $invitation->guests()->count();
            foreach (['confirmed' => 'CONFIRMED', 'declined' => 'DECLINED', 'pending' => 'PENDING'] as $key => $value) {
                $summary[$key] = $invitation->guests()->whereHas('rsvp', fn($query) => $query->where('status', $value))->count();
            }
            $summary['unanswered'] = $invitation->guests()->whereDoesntHave('rsvp')->count();
            $responses = $invitation->guests()->with(['table', 'rsvp'])
                ->when($status === 'UNANSWERED', fn($query) => $query->whereDoesntHave('rsvp'))
                ->when($status && $status !== 'UNANSWERED', fn($query) => $query->whereHas('rsvp', fn($rsvp) => $rsvp->where('status', $status)))
                ->when($search !== '', fn($query) => $query->where('name', 'like', '%' . $search . '%'))
                ->reorder()->orderBy('name')->orderBy('id')->paginate(10)->withQueryString()
                ->through(fn($guest) => [
                    'id' => $guest->id,
                    'name' => $guest->name,
                    'table' => $guest->table?->name,
                    'status' => $guest->rsvp?->status ?? 'UNANSWERED',
                    'message' => $guest->rsvp?->message,
                    'respondedAt' => $guest->rsvp?->updated_at?->toIso8601String(),
                ]);
        }

        return Inertia::render('backoffice/Konvitte/KonvitteRsvps', [
            'invitation' => $invitation ? ['id' => $invitation->id, 'name' => $invitation->groom_name . ' & ' . $invitation->bride_name] : null,
            'invitations' => KonvitteInvitation::latest('id')->get()->map(fn($item) => ['id' => $item->id, 'name' => $item->groom_name . ' & ' . $item->bride_name]),
            'summary' => $summary,
            'responses' => $responses,
            'filters' => ['status' => $status, 'search' => $search],
        ]);
    }
}
