<?php

namespace Database\Seeders;

use App\Models\Konvitte\KonvitteInvitation;
use App\Models\Konvitte\KonvitteInvitationSlug;
use App\Models\Konvitte\KonvitteInviteType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CasamentoVictoriaManecasSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $tipo = KonvitteInviteType::firstOrCreate(['code' => 'CASAMENTO'], ['name' => 'Casamento']);
            $invitation = KonvitteInvitation::query()->updateOrCreate(
                ['bride_name' => 'Victória', 'groom_name' => 'Manecas', 'event_date' => '2026-11-21 12:00:00'],
                [
                    'konvitte_invite_type_id' => $tipo->id,
                    'groom_father_name' => 'Pedro Sebastião',
                    'groom_mother_name' => 'Elina Baloi',
                    'bride_father_name' => 'Domingo Mamborisse',
                    'bride_mother_name' => 'Leopordina Meneses',
                    'venue' => 'Salão do Reino da Munhava',
                    'bible_text' => 'Melhor dois do que um, e um cordão tríplice não pode ser facilmente rompido.',
                    'bible_reference' => 'Eclesiastes 4:9-12',
                    'couple_text' => 'Victória e Manecas convidam para celebrar este momento especial.',
                    'celebration_text' => 'Celebre conosco',
                    'instructions' => 'Traje formal. Música de fundo: clip musical com o tema “Um amor verdadeiro”.',
                ],
            );

            $baseSlug = 'casamento-de-manecas-e-victoria-2026';
            $slug = $baseSlug;
            $counter = 2;
            while (KonvitteInvitationSlug::query()->where('slug', $slug)->where('konvitte_invitation_id', '!=', $invitation->id)->exists()) {
                $slug = $baseSlug . '-' . ($counter++);
            }
            $invitation->slug()->updateOrCreate([], ['slug' => $slug]);

            $invitation->programItems()->delete();
            $invitation->programItems()->createMany([
                ['time' => '12:00', 'name' => 'Registo civil e discurso', 'location' => 'Salão do Reino da Munhava', 'google_maps_link' => null, 'icon' => 'church', 'sort_order' => 0],
                ['time' => '16:30', 'name' => 'Copo de água', 'location' => 'Salão July, Curva da Munhava, ao lado do Lilas', 'google_maps_link' => null, 'icon' => 'glass', 'sort_order' => 1],
            ]);

            $invitation->contacts()->delete();
            $invitation->tables()->delete();
        });

        $invitation = KonvitteInvitation::query()->where('bride_name', 'Victória')->where('groom_name', 'Manecas')->latest('id')->firstOrFail();
        $this->command?->info('Convite criado: ' . $invitation->slug()->value('slug'));
        $this->command?->info('Link reservado: sonild.test/konvitte/' . $invitation->slug()->value('slug') . '');
    }
}
