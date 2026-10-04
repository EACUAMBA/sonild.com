<?php

namespace App\Http\Controllers\Backoffice\Konvitte;

use App\Http\Controllers\Controller;
use App\Models\Konvitte\KonvitteInvitation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KonvitteMessageController extends Controller
{
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
                    'text' => $message->text, 'sentAt' => $message->created_at->toIso8601String(),
                ]) : ['data' => [], 'current_page' => 1, 'total' => 0],
            'search' => $search,
        ]);
    }
}
