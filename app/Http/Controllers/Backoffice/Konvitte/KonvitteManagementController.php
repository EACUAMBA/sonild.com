<?php

namespace App\Http\Controllers\Backoffice\Konvitte;

use App\Http\Controllers\Controller;
use App\Models\Konvitte\KonvitteGuestSlug;
use App\Models\Konvitte\KonvitteInvitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class KonvitteManagementController extends Controller
{
    public function storeTable(Request $request, KonvitteInvitation $invitation): RedirectResponse
    {
        $this->ensureAccess();
        $data = $request->validate(['name' => ['required', 'string', 'max:120']]);
        $invitation->tables()->firstOrCreate(['name' => $data['name']]);
        return back()->with('success', 'Konvitte table created.');
    }

    private function ensureAccess(): void
    {
        abort_unless(request()->user()?->hasModulePermission('backoffice', 'ACL'), 403);
    }

    public function tables(?KonvitteInvitation $invitation = null): Response
    {
        return $this->index('KonvitteTables', $invitation);
    }

    private function index(string $page, ?KonvitteInvitation $invitation): Response
    {
        $this->ensureAccess();
        $invitation ??= KonvitteInvitation::latest('id')->first();
        return Inertia::render('backoffice/Konvitte/' . $page, [
            'invitation' => $invitation ? ['id' => $invitation->id, 'name' => $invitation->groom_name . ' & ' . $invitation->bride_name, 'slug' => $invitation->slug?->slug] : null,
            'invitations' => KonvitteInvitation::latest('id')->get()->map(fn($item) => ['id' => $item->id, 'name' => $item->groom_name . ' & ' . $item->bride_name]),
            'tables' => $invitation?->tables()->withCount('guests')->get()->map(fn($table) => ['id' => $table->id, 'name' => $table->name, 'guestCount' => $table->guests_count]) ?? [],
            'guests' => $invitation && $page === 'KonvitteGuests' ? $invitation->guests()->with(['table', 'slug'])->paginate(10)->through(fn($guest) => [
                'id' => $guest->id, 'name' => $guest->name, 'table' => $guest->table?->name, 'maxGuests' => $guest->max_guests, 'slug' => $guest->slug?->slug,
            ]) : ['data' => [], 'current_page' => 1, 'last_page' => 1],
        ]);
    }

    public function guests(?KonvitteInvitation $invitation = null): Response
    {
        return $this->index('KonvitteGuests', $invitation);
    }

    public function storeGuest(Request $request, KonvitteInvitation $invitation): RedirectResponse
    {
        $this->ensureAccess();
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'tableId' => ['nullable', 'integer', Rule::exists('konvitte_tables', 'id')->where('konvitte_invitation_id', $invitation->id)],
            'maxGuests' => ['required', 'integer', 'min:1', 'max:999'],
        ]);
        DB::transaction(function () use ($data, $invitation): void {
            $guest = $invitation->guests()->create(['name' => $data['name'], 'konvitte_table_id' => $data['tableId'] ?? null, 'max_guests' => $data['maxGuests']]);
            $base = Str::slug($guest->name) ?: 'guest';
            $slug = $base;
            $counter = 2;
            while (KonvitteGuestSlug::where('slug', $slug)->exists()) $slug = $base . '-' . ($counter++);
            $guest->slug()->create(['slug' => $slug]);
        });
        return back()->with('success', 'Konvitte guest created.');
    }
}
