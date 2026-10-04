<?php

namespace App\Http\Controllers\Invitations;

use App\Http\Controllers\Controller;
use App\Models\Konvitte\KonvitteInvitationSlug;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicKonvitteInvitationController extends Controller
{
    public function show(Request $request, string $slug, ?string $guestSlug = null): Response
    {
        $slugRecord = KonvitteInvitationSlug::query()->where('slug', $slug)->firstOrFail();
        $invitation = $slugRecord->invitation()->with(['programItems', 'gallery', 'contacts', 'inviteType', 'files'])->firstOrFail();

        $guest = $guestSlug ? $invitation->guests()->whereHas('slug', fn($query) => $query->where('slug', $guestSlug))->with('table')->firstOrFail() : null;

        return Inertia::render('welcome', [
            'invitationData' => [
                'groom' => $invitation->groom_name,
                'bride' => $invitation->bride_name,
                'guest' => $guest?->name ?? 'Convidado especial',
                'date' => $invitation->event_date?->toIso8601String(),
                'dateLabel' => $invitation->event_date?->locale('pt')->translatedFormat('j \\d\\e F \\d\\e Y'),
                'dayLabel' => $invitation->event_date?->locale('pt')->translatedFormat('l'),
                'bible' => $invitation->bible_text,
                'bibleReference' => $invitation->bible_reference,
                'table' => $guest?->table?->name ?? 'A definir',
                'invitationType' => $invitation->inviteType?->name ?? 'Convite de casamento',
                'guestLimit' => $guest ? 'Válido para ' . $guest->max_guests . ' pessoa(s)' : 'Consulte o seu convite',
                'children' => 'Conforme indicação do convite',
                'parents' => [
                    'groom' => implode(' e ', array_filter([$invitation->groom_father_name, $invitation->groom_mother_name])),
                    'bride' => implode(' e ', array_filter([$invitation->bride_father_name, $invitation->bride_mother_name])),
                ],
                'venue' => $invitation->venue,
                'address' => '',
                'coverImage' => $invitation->fileFor('cover')?->url(),
                'heroImage' => $invitation->fileFor('hero')?->url(),
                'informationImage' => $invitation->fileFor('information')?->url(),
                'music' => $invitation->fileFor('music')?->url(),
                'coupleText' => $invitation->couple_text,
                'celebrationText' => $invitation->celebration_text,
                'instructions' => $invitation->instructions,
                'contacts' => $invitation->contacts->map(fn($contact) => [
                    'name' => $contact->name, 'phone' => $contact->phone, 'email' => $contact->email,
                ])->values(),
                'program' => $invitation->programItems->map(fn($item) => [
                    'time' => $item->time,
                    'mapUrl' => preg_match('~^https?://~i', $item->google_maps_link ?? '') ? $item->google_maps_link : null,
                    'title' => $item->name,
                    'description' => $item->location ?? '',
                ])->values(),
                'gallery' => $invitation->gallery->map(fn($image) => [
                    'src' => $image->url(),
                    'alt' => $image->name,
                ])->values(),
            ],
        ]);
    }
}
