<?php

namespace App\Http\Controllers\Backoffice\Konvitte;

use App\Http\Controllers\Controller;
use App\Models\File;
use App\Models\Konvitte\KonvitteGuestSlug;
use App\Models\Konvitte\KonvitteInvitation;
use App\Models\Konvitte\KonvitteInvitationSlug;
use App\Models\Konvitte\KonvitteInviteType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class KonvitteInvitationController extends Controller
{
    public function index(): Response
    {
        $this->ensureAccess();
        return Inertia::render('backoffice/Konvitte/KonvitteInvitations', [
            'invitations' => KonvitteInvitation::managedBy(request()->user())->with(['inviteType', 'slug'])->latest('id')->paginate(10)->through(fn($invitation) => [
                'id' => $invitation->id,
                'name' => $invitation->groom_name . ' & ' . $invitation->bride_name,
                'type' => $invitation->inviteType?->name,
                'date' => $invitation->event_date?->format('Y-m-d'),
                'slug' => $invitation->slug?->slug,
            ]),
        ]);
    }

    private function ensureAccess(): void
    {
        abort_unless(request()->user()?->canManageKonvitte(), 403);
    }

    public function destroy(KonvitteInvitation $invitation): RedirectResponse
    {
        $this->ensureAccess();
        DB::transaction(fn() => $invitation->delete());
        return to_route('backoffice.konvitte.invitations.index')->with('success', 'Convite eliminado.');
    }

    public function edit(?KonvitteInvitation $invitation = null): Response
    {
        $this->ensureAccess();
        $invitation?->load(['inviteType:id,name,code', 'programItems', 'gallery', 'contacts', 'slug', 'files']);
        return Inertia::render('backoffice/Konvitte/KonvitteInvitation', [
            'inviteTypes' => KonvitteInviteType::query()->orderBy('name')->get(['id', 'name', 'code']),
            'convite' => $invitation ? [
                'id' => $invitation->id, 'inviteTypeId' => $invitation->konvitte_invite_type_id, 'nomeNoiva' => $invitation->bride_name, 'nomeNoivo' => $invitation->groom_name, 'nomePaiNoivo' => $invitation->groom_father_name, 'nomeMaeNoivo' => $invitation->groom_mother_name, 'nomePaiNoiva' => $invitation->bride_father_name, 'nomeMaeNoiva' => $invitation->bride_mother_name, 'slug' => $invitation->slug?->slug,
                'data' => $invitation->event_date?->format('Y-m-d\TH:i'), 'local' => $invitation->venue, 'googleMapsLink' => $invitation->google_maps_link, 'textoBiblico' => $invitation->bible_text,
                'livroBiblico' => $invitation->bible_reference, 'fotoCapa' => $invitation->fileFor('cover')?->path, 'fotoInicial' => $invitation->fileFor('hero')?->path,
                'musicTitle' => $invitation->music_title, 'musicArtist' => $invitation->music_artist,
                'musica' => $invitation->fileFor('music')?->path, 'textoCasal' => $invitation->couple_text, 'fotoInformacoes' => $invitation->fileFor('information')?->path,
                'rsvpEnabled' => $invitation->rsvp_enabled,
                'textoCelebre' => $invitation->celebration_text, 'textoOrientacoes' => $invitation->instructions,
                'program' => $invitation->programItems->map(fn($item) => ['hora' => $item->time, 'nome' => $item->name, 'localizacao' => $item->location, 'googleMapsLink' => $item->google_maps_link, 'icon' => $item->icon])->values(),
                'contacts' => $invitation->contacts->map(fn($contact) => ['nome' => $contact->name, 'telefone' => $contact->phone, 'email' => $contact->email])->values(),
                'gallery' => $invitation->gallery->map(fn($image) => ['id' => $image->id, 'name' => $image->name, 'url' => $image->url()])->values(),
            ] : null,
        ]);
    }

    public function save(Request $request, ?KonvitteInvitation $invitation = null): RedirectResponse
    {
        $this->ensureAccess();
        $data = $request->validate([
            'inviteTypeId' => ['required', 'integer', 'exists:konvitte_invite_types,id'], 'nomeNoiva' => ['required', 'string', 'max:255'], 'nomeNoivo' => ['required', 'string', 'max:255'], 'nomePaiNoivo' => ['required', 'string', 'max:255'], 'nomeMaeNoivo' => ['required', 'string', 'max:255'], 'nomePaiNoiva' => ['required', 'string', 'max:255'], 'nomeMaeNoiva' => ['required', 'string', 'max:255'], 'data' => ['required', 'date'], 'local' => ['required', 'string', 'max:255'],
            'rsvpEnabled' => ['sometimes', 'boolean'],
            'musicTitle' => ['sometimes', 'nullable', 'string', 'max:255'],
            'musicArtist' => ['sometimes', 'nullable', 'string', 'max:255'],
            'googleMapsLink' => ['nullable', 'url:http,https', 'max:500'],
            'textoBiblico' => ['nullable', 'string'], 'livroBiblico' => ['nullable', 'string', 'max:120'], 'textoCasal' => ['nullable', 'string'], 'textoCelebre' => ['required', 'string'], 'textoOrientacoes' => ['nullable', 'string'],
            'fotoCapa' => ['nullable', 'image', 'max:5120'], 'fotoInicial' => ['nullable', 'image', 'max:5120'], 'fotoInformacoes' => ['nullable', 'image', 'max:5120'], 'musica' => ['nullable', 'file', 'mimes:mp3,wav,ogg', 'max:20480'],
            'gallery' => ['nullable', 'array'], 'gallery.*' => ['image', 'max:5120'],
            'program' => ['nullable', 'array'], 'program.*.hora' => ['nullable', 'string', 'max:5'], 'program.*.nome' => ['nullable', 'string', 'max:255'], 'program.*.localizacao' => ['nullable', 'string', 'max:255'], 'program.*.googleMapsLink' => ['nullable', 'url', 'max:500'], 'program.*.icon' => ['nullable', 'string', 'max:40'],
            'contacts' => ['nullable', 'array'], 'contacts.*.nome' => ['nullable', 'string', 'max:255'], 'contacts.*.telefone' => ['nullable', 'string', 'max:60'], 'contacts.*.email' => ['nullable', 'email', 'max:255'],
        ]);
        DB::transaction(function () use ($request, $data, &$invitation): void {
            $invitation ??= new KonvitteInvitation();
            if (!$invitation->exists) $invitation->user_id = $request->user()->id;
            $invitation->fill(['konvitte_invite_type_id' => $data['inviteTypeId'], 'bride_name' => $data['nomeNoiva'], 'groom_name' => $data['nomeNoivo'], 'groom_father_name' => $data['nomePaiNoivo'], 'groom_mother_name' => $data['nomeMaeNoivo'], 'bride_father_name' => $data['nomePaiNoiva'], 'bride_mother_name' => $data['nomeMaeNoiva'], 'event_date' => $data['data'], 'venue' => $data['local'], 'google_maps_link' => $data['googleMapsLink'] ?? null, 'bible_text' => $data['textoBiblico'] ?? null, 'bible_reference' => $data['livroBiblico'] ?? null, 'couple_text' => $data['textoCasal'] ?? null, 'celebration_text' => $data['textoCelebre'], 'instructions' => $data['textoOrientacoes'] ?? null]);
            if (array_key_exists('rsvpEnabled', $data)) $invitation->rsvp_enabled = (bool)$data['rsvpEnabled'];
            foreach (['musicTitle' => 'music_title', 'musicArtist' => 'music_artist'] as $input => $column) {
                if (array_key_exists($input, $data)) $invitation->{$column} = $data[$input];
            }
            $invitation->save();
            foreach (['fotoCapa' => 'cover', 'fotoInicial' => 'hero', 'fotoInformacoes' => 'information', 'musica' => 'music'] as $input => $role) {
                if ($request->hasFile($input)) {
                    $file = File::storeUpload($request->file($input));
                    $invitation->files()->wherePivot('role', $role)->detach();
                    $invitation->files()->attach($file->id, ['role' => $role]);
                }
            }
            if (!$invitation->slug()->exists()) {
                $baseSlug = 'casamento-de-' . Str::slug($data['nomeNoivo']) . '-e-' . Str::slug($data['nomeNoiva']) . '-' . date('Y', strtotime($data['data']));
                $slug = $baseSlug;
                $counter = 2;
                while (KonvitteInvitationSlug::query()->where('slug', $slug)->where('konvitte_invitation_id', '!=', $invitation->id)->exists()) $slug = $baseSlug . '-' . ($counter++);
                $invitation->slug()->create(['slug' => $slug]);
            }
            $invitation->programItems()->delete();
            foreach (collect($data['program'] ?? [])->filter(fn($item) => filled($item['nome'] ?? null))->values() as $order => $item) $invitation->programItems()->create(['time' => $item['hora'] ?? '', 'name' => $item['nome'], 'location' => $item['localizacao'] ?? null, 'google_maps_link' => $item['googleMapsLink'] ?? null, 'icon' => $item['icon'] ?? 'calendar', 'sort_order' => $order]);
            $invitation->contacts()->delete();
            foreach (collect($data['contacts'] ?? [])->filter(fn($item) => filled($item['nome'] ?? null))->values() as $order => $contact) $invitation->contacts()->create(['name' => $contact['nome'], 'phone' => $contact['telefone'] ?? null, 'email' => $contact['email'] ?? null, 'sort_order' => $order]);
            foreach ($request->file('gallery', []) as $image) {
                $file = File::storeUpload($image);
                $invitation->files()->attach($file->id, ['role' => 'gallery']);
            }
        });
        return to_route('backoffice.konvitte.invitations.edit', $invitation)->with('success', 'Convite guardado com sucesso.');
    }

    public function storeLegacyTable(Request $request, KonvitteInvitation $invitation): RedirectResponse
    {
        $this->ensureAccess();
        $data = $request->validate(['nome' => ['required', 'string', 'max:120']]);
        $invitation->tables()->firstOrCreate(['name' => $data['nome']]);
        return back()->with('success', 'Mesa adicionada com sucesso.');
    }

    public function storeLegacyGuest(Request $request, KonvitteInvitation $invitation): RedirectResponse
    {
        $this->ensureAccess();
        $data = $request->validate(['nome' => ['required', 'string', 'max:255'], 'mesaId' => ['nullable', 'integer', 'exists:konvitte_tables,id'], 'numeroMaximoConvidados' => ['required', 'integer', 'min:1', 'max:999']]);
        abort_unless(!($data['mesaId'] ?? null) || $invitation->tables()->whereKey($data['mesaId'])->exists(), 422);
        DB::transaction(function () use ($data, $invitation): void {
            $guest = $invitation->guests()->create(['name' => $data['nome'], 'konvitte_table_id' => $data['mesaId'] ?? null, 'max_guests' => $data['numeroMaximoConvidados']]);
            $baseSlug = Str::slug($guest->name);
            $slug = $baseSlug;
            $counter = 2;
            while (KonvitteGuestSlug::query()->where('slug', $slug)->exists()) $slug = $baseSlug . '-' . ($counter++);
            $guest->slug()->create(['slug' => $slug]);
        });
        return back()->with('success', 'Convidado adicionado com sucesso.');
    }
}
