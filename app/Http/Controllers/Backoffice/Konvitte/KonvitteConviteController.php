<?php

namespace App\Http\Controllers\Backoffice\Konvitte;

use App\Http\Controllers\Controller;
use App\Models\Konvitte\KonvitteConvite;
use App\Models\Konvitte\KonvitteConviteSlug;
use App\Models\Konvitte\KonvitteInviteType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class KonvitteConviteController extends Controller
{
    public function edit(?KonvitteConvite $convite = null): Response
    {
        $this->ensureAccess();
        $convite?->load(['inviteType:id,name,code', 'programItems', 'gallery', 'contacts', 'slug']);
        return Inertia::render('backoffice/Konvitte/Convite', [
            'inviteTypes' => KonvitteInviteType::query()->orderBy('name')->get(['id', 'name', 'code']),
            'convite' => $convite ? [
                'id' => $convite->id, 'inviteTypeId' => $convite->konvitte_invite_type_id, 'nomeNoiva' => $convite->nome_noiva, 'nomeNoivo' => $convite->nome_noivo, 'slug' => $convite->slug?->slug,
                'data' => $convite->data?->format('Y-m-d\TH:i'), 'local' => $convite->local, 'textoBiblico' => $convite->texto_biblico,
                'livroBiblico' => $convite->livro_biblico, 'fotoCapa' => $convite->foto_capa, 'fotoInicial' => $convite->foto_inicial,
                'musica' => $convite->musica, 'textoCasal' => $convite->texto_casal, 'fotoInformacoes' => $convite->foto_informacoes,
                'textoCelebre' => $convite->texto_celebre, 'textoOrientacoes' => $convite->texto_orientacoes,
                'program' => $convite->programItems->map(fn($item) => ['hora' => $item->hora, 'nome' => $item->nome, 'localizacao' => $item->localizacao, 'googleMapsLink' => $item->google_maps_link, 'icon' => $item->icon])->values(),
                'contacts' => $convite->contacts->map(fn($contact) => ['categoria' => $contact->categoria, 'nome' => $contact->nome, 'telefone' => $contact->telefone, 'email' => $contact->email])->values(),
                'gallery' => $convite->gallery->map(fn($image) => ['id' => $image->id, 'name' => $image->original_name, 'url' => Storage::disk('public')->url($image->path)])->values(),
            ] : null,
        ]);
    }

    private function ensureAccess(): void
    {
        abort_unless(request()->user()?->hasModulePermission('backoffice', 'ACL'), 403);
    }

    public function save(Request $request, ?KonvitteConvite $convite = null): RedirectResponse
    {
        $this->ensureAccess();
        $data = $request->validate([
            'inviteTypeId' => ['required', 'integer', 'exists:konvitte_invite_types,id'], 'nomeNoiva' => ['required', 'string', 'max:255'], 'nomeNoivo' => ['required', 'string', 'max:255'], 'data' => ['required', 'date'], 'local' => ['required', 'string', 'max:255'],
            'textoBiblico' => ['nullable', 'string'], 'livroBiblico' => ['nullable', 'string', 'max:120'], 'textoCasal' => ['nullable', 'string'], 'textoCelebre' => ['required', 'string'], 'textoOrientacoes' => ['nullable', 'string'],
            'fotoCapa' => ['nullable', 'image', 'max:5120'], 'fotoInicial' => ['nullable', 'image', 'max:5120'], 'fotoInformacoes' => ['nullable', 'image', 'max:5120'], 'musica' => ['nullable', 'file', 'mimes:mp3,wav,ogg', 'max:20480'],
            'gallery' => ['nullable', 'array'], 'gallery.*' => ['image', 'max:5120'],
            'program' => ['nullable', 'array'], 'program.*.hora' => ['nullable', 'string', 'max:5'], 'program.*.nome' => ['nullable', 'string', 'max:255'], 'program.*.localizacao' => ['nullable', 'string', 'max:255'], 'program.*.googleMapsLink' => ['nullable', 'url', 'max:500'], 'program.*.icon' => ['nullable', 'string', 'max:40'],
            'contacts' => ['nullable', 'array'], 'contacts.*.categoria' => ['nullable', 'string', 'max:80'], 'contacts.*.nome' => ['nullable', 'string', 'max:255'], 'contacts.*.telefone' => ['nullable', 'string', 'max:60'], 'contacts.*.email' => ['nullable', 'email', 'max:255'],
        ]);
        DB::transaction(function () use ($request, $data, $convite): void {
            $convite ??= new KonvitteConvite();
            $convite->fill(['konvitte_invite_type_id' => $data['inviteTypeId'], 'nome_noiva' => $data['nomeNoiva'], 'nome_noivo' => $data['nomeNoivo'], 'data' => $data['data'], 'local' => $data['local'], 'texto_biblico' => $data['textoBiblico'] ?? null, 'livro_biblico' => $data['livroBiblico'] ?? null, 'texto_casal' => $data['textoCasal'] ?? null, 'texto_celebre' => $data['textoCelebre'], 'texto_orientacoes' => $data['textoOrientacoes'] ?? null]);
            foreach (['fotoCapa' => 'foto_capa', 'fotoInicial' => 'foto_inicial', 'fotoInformacoes' => 'foto_informacoes', 'musica' => 'musica'] as $input => $column) {
                if ($request->hasFile($input)) {
                    if ($convite->{$column}) Storage::disk('public')->delete($convite->{$column});
                    $convite->{$column} = $request->file($input)->store('konvitte/convites', 'public');
                }
            }
            $convite->save();
            $baseSlug = 'casamento-de-' . Str::slug($data['nomeNoivo']) . '-e-' . Str::slug($data['nomeNoiva']) . '-' . date('Y', strtotime($data['data']));
            $slug = $baseSlug;
            $counter = 2;
            while (KonvitteConviteSlug::query()->where('slug', $slug)->where('konvitte_convite_id', '!=', $convite->id)->exists()) $slug = $baseSlug . '-' . ($counter++);
            $convite->slug()->updateOrCreate([], ['slug' => $slug]);
            $convite->programItems()->delete();
            foreach (collect($data['program'] ?? [])->filter(fn($item) => filled($item['nome'] ?? null))->values() as $order => $item) $convite->programItems()->create(['hora' => $item['hora'] ?? '', 'nome' => $item['nome'], 'localizacao' => $item['localizacao'] ?? null, 'google_maps_link' => $item['googleMapsLink'] ?? null, 'icon' => $item['icon'] ?? 'calendar', 'ordem' => $order]);
            $convite->contacts()->delete();
            foreach (collect($data['contacts'] ?? [])->filter(fn($item) => filled($item['nome'] ?? null))->values() as $order => $contact) $convite->contacts()->create(['categoria' => $contact['categoria'] ?? 'Outro', 'nome' => $contact['nome'], 'telefone' => $contact['telefone'] ?? null, 'email' => $contact['email'] ?? null, 'ordem' => $order]);
            foreach ($request->file('gallery', []) as $image) $convite->gallery()->create(['path' => $image->store('konvitte/gallery', 'public'), 'original_name' => $image->getClientOriginalName(), 'size' => $image->getSize()]);
        });
        return back()->with('success', 'Convite guardado com sucesso.');
    }
}
