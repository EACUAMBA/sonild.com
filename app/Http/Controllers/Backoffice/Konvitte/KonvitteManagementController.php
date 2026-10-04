<?php

namespace App\Http\Controllers\Backoffice\Konvitte;

use App\Http\Controllers\Controller;
use App\Models\Konvitte\KonvitteGuest;
use App\Models\Konvitte\KonvitteGuestSlug;
use App\Models\Konvitte\KonvitteInvitation;
use App\Models\Konvitte\KonvitteTable;
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
        $data = $request->validate(['name' => ['required', 'string', 'max:120'], 'capacity' => ['nullable', 'integer', 'min:1', 'max:999']], $this->validationMessages(), ['name' => 'nome da mesa', 'capacity' => 'capacidade']);
        $invitation->tables()->firstOrCreate(['name' => $data['name']], ['capacity' => $data['capacity'] ?? null]);
        return back()->with('success', 'Mesa guardada com sucesso.');
    }

    public function updateTable(Request $request, KonvitteInvitation $invitation, KonvitteTable $table): RedirectResponse
    {
        $this->ensureAccess();
        abort_unless($table->konvitte_invitation_id === $invitation->id, 404);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120', Rule::unique('konvitte_tables', 'name')->where('konvitte_invitation_id', $invitation->id)->ignore($table->id)],
            'capacity' => ['nullable', 'integer', 'min:1', 'max:999'],
        ], $this->validationMessages(), ['name' => 'nome da mesa', 'capacity' => 'capacidade']);
        $table->update(['name' => $data['name'], 'capacity' => $data['capacity'] ?? null]);

        return back()->with('success', 'Mesa atualizada com sucesso.');
    }

    private function validationMessages(): array
    {
        return [
            'unique' => 'Já existe uma mesa com este nome neste convite.',
            'required' => 'O campo :attribute é obrigatório.',
            'string' => 'O campo :attribute deve ser um texto.',
            'integer' => 'O campo :attribute deve ser um número inteiro.',
            'min.numeric' => 'O campo :attribute deve ser pelo menos :min.',
            'max.numeric' => 'O campo :attribute não pode ultrapassar :max.',
            'max.string' => 'O campo :attribute não pode ultrapassar :max caracteres.',
            'exists' => 'A mesa selecionada não pertence a este convite.',
            'prohibits' => 'Selecione uma mesa ou escreva o nome de uma nova mesa.',
        ];
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
            'tables' => $invitation?->tables()->withCount('guests')->withSum('guests', 'max_guests')->get()->map(fn($table) => ['id' => $table->id, 'name' => $table->name, 'guestCount' => $table->guests_count, 'capacity' => $table->capacity, 'allocatedSeats' => (int)$table->guests_sum_max_guests]) ?? [],
            'guests' => $invitation && $page === 'KonvitteGuests' ? $invitation->guests()->with(['table', 'slug'])->paginate(10)->through(fn($guest) => [
                'id' => $guest->id, 'name' => $guest->name, 'table' => $guest->table?->name, 'tableId' => $guest->konvitte_table_id, 'maxGuests' => $guest->max_guests, 'slug' => $guest->slug?->slug,
            ]) : ['data' => [], 'current_page' => 1, 'last_page' => 1],
        ]);
    }

    public function guests(?KonvitteInvitation $invitation = null): Response
    {
        return $this->index('KonvitteGuests', $invitation);
    }

    public function storeGuest(Request $request, KonvitteInvitation $invitation): RedirectResponse
    {
        return $this->saveGuest($request, $invitation);
    }

    public function updateGuest(Request $request, KonvitteInvitation $invitation, KonvitteGuest $guest): RedirectResponse
    {
        $this->ensureAccess();
        abort_unless($guest->konvitte_invitation_id === $invitation->id, 404);

        return $this->saveGuest($request, $invitation, $guest);
    }

    private function saveGuest(Request $request, KonvitteInvitation $invitation, ?KonvitteGuest $guest = null): RedirectResponse
    {
        $this->ensureAccess();
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'tableId' => ['nullable', 'integer', Rule::exists('konvitte_tables', 'id')->where('konvitte_invitation_id', $invitation->id)],
            'tableName' => ['nullable', 'string', 'max:120', 'prohibits:tableId'],
            'tableCapacity' => ['nullable', 'integer', 'min:1', 'max:999'],
            'maxGuests' => ['required', 'integer', 'min:1', 'max:999'],
        ], $this->validationMessages(), ['name' => 'nome do convidado', 'tableId' => 'mesa', 'tableName' => 'nome da mesa', 'tableCapacity' => 'capacidade da mesa', 'maxGuests' => 'número máximo de convidados']);
        DB::transaction(function () use ($data, $invitation, $guest): void {
            $tableId = $data['tableId'] ?? null;
            if (!empty($data['tableName'])) {
                $table = $invitation->tables()->firstOrCreate(
                    ['name' => $data['tableName']],
                    ['capacity' => $data['tableCapacity'] ?? null],
                );
                $tableId = $table->id;
            }
            $attributes = ['name' => $data['name'], 'konvitte_table_id' => $tableId, 'max_guests' => $data['maxGuests']];
            if ($guest) {
                $guest->update($attributes);
                return;
            }
            $guest = $invitation->guests()->create($attributes);
            $base = Str::slug($guest->name) ?: 'guest';
            $slug = $base;
            $counter = 2;
            while (KonvitteGuestSlug::where('slug', $slug)->exists()) $slug = $base . '-' . ($counter++);
            $guest->slug()->create(['slug' => $slug]);
        });
        return back()->with('success', $guest ? 'Convidado atualizado com sucesso.' : 'Convidado registado com sucesso.');
    }
}
