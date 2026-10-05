<?php

namespace App\Http\Controllers\Backoffice\Konvitte;

use App\Http\Controllers\Controller;
use App\Models\Konvitte\KonvitteInvitation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KonvitteMessageController extends Controller
{
    public function setVisibility(Request $request, KonvitteInvitation $invitation, int $message): \Illuminate\Http\RedirectResponse
    {
        abort_unless($request->user()?->hasModulePermission('backoffice', 'ACL'), 403);
        $record = $invitation->messages()->findOrFail($message);
        $data = $request->validate(['hidden' => ['required', 'boolean']]);
        $record->update(['hidden_by_admin' => $data['hidden']]);
        return back()->with('success', 'Visibilidade da mensagem atualizada.');
    }

    public function index(Request $request, ?KonvitteInvitation $invitation = null): Response
    {
        abort_unless($request->user()?->hasModulePermission('backoffice', 'ACL'), 403);
        $invitation ??= KonvitteInvitation::latest('id')->first();
        $search = $request->query('search', '');
        abort_unless(is_string($search) && mb_strlen($search) <= 120, 400);
        $search = trim($search);

        return Inertia::render('backoffice/Konvitte/KonvitteMessages', [
            'invitation' => $invitation ? ['id' => $invitation->id, 'name' => $invitation->groom_name . ' & ' . $invitation->bride_name] : null,
            'invitations' => KonvitteInvitation::latest('id')->get()->map(fn($item) => ['id' => $item->id, 'name' => $item->groom_name . ' & ' . $item->bride_name]),
            'messages' => $invitation ? $invitation->messages()->with('guest')
                ->when($search !== '', fn($query) => $query->whereHas('guest', fn($guest) => $guest->where('name', 'like', '%' . $search . '%')))
                ->latest('id')->paginate(10)->withQueryString()->through(fn($message) => [
                    'id' => $message->id, 'guest' => $message->guest->name,
                    'text' => ($message->hidden_by_guest || $message->hidden_by_admin) ? null : $message->text,
                    'hiddenByGuest' => $message->hidden_by_guest, 'hiddenByAdmin' => $message->hidden_by_admin, 'sentAt' => $message->created_at->toIso8601String(),
                ]) : ['data' => [], 'current_page' => 1, 'total' => 0],
            'search' => $search,
        ]);
    }
}
