<?php

namespace Database\Seeders;

use App\Models\Konvitte\KonvitteConvite;
use App\Models\Konvitte\KonvitteConviteSlug;
use App\Models\Konvitte\KonvitteInviteType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CasamentoVictoriaManecasSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $tipo = KonvitteInviteType::firstOrCreate(['code' => 'CASAMENTO'], ['name' => 'Casamento']);
            $convite = KonvitteConvite::query()->updateOrCreate(
                ['nome_noiva' => 'Victória', 'nome_noivo' => 'Manecas', 'data' => '2026-11-21 12:00:00'],
                [
                    'konvitte_invite_type_id' => $tipo->id,
                    'nome_pai_noivo' => 'Pedro Sebastião',
                    'nome_mae_noivo' => 'Elina Baloi',
                    'nome_pai_noiva' => 'Domingo Mamborisse',
                    'nome_mae_noiva' => 'Leopordina Meneses',
                    'local' => 'Salão do Reino da Munhava',
                    'texto_biblico' => 'Melhor dois do que um, e um cordão tríplice não pode ser facilmente rompido.',
                    'livro_biblico' => 'Eclesiastes 4:9-12',
                    'texto_casal' => 'Victória e Manecas convidam para celebrar este momento especial.',
                    'texto_celebre' => 'Celebre conosco',
                    'texto_orientacoes' => 'Traje formal. Música de fundo: clip musical com o tema “Um amor verdadeiro”.',
                ],
            );

            $baseSlug = 'casamento-de-manecas-e-victoria-2026';
            $slug = $baseSlug;
            $counter = 2;
            while (KonvitteConviteSlug::query()->where('slug', $slug)->where('konvitte_convite_id', '!=', $convite->id)->exists()) {
                $slug = $baseSlug . '-' . ($counter++);
            }
            $convite->slug()->updateOrCreate([], ['slug' => $slug]);

            $convite->programItems()->delete();
            $convite->programItems()->createMany([
                ['hora' => '12:00', 'nome' => 'Registo civil e discurso', 'localizacao' => 'Salão do Reino da Munhava', 'google_maps_link' => null, 'icon' => 'church', 'ordem' => 0],
                ['hora' => '16:30', 'nome' => 'Copo de água', 'localizacao' => 'Salão July, Curva da Munhava, ao lado do Lilas', 'google_maps_link' => null, 'icon' => 'glass', 'ordem' => 1],
            ]);

            $convite->contacts()->delete();
            $convite->mesas()->delete();
        });

        $convite = KonvitteConvite::query()->where('nome_noiva', 'Victória')->where('nome_noivo', 'Manecas')->latest('id')->firstOrFail();
        $this->command?->info('Convite criado: ' . $convite->slug()->value('slug'));
        $this->command?->info('Link reservado: sonild.test/konvitte/' . $convite->slug()->value('slug') . '/convidado');
    }
}
