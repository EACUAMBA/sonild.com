<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

it('preserves invitation data and media when replacing the legacy schema', function () {
    $original = DB::getDefaultConnection();
    config(['database.connections.konvitte_migration_test' => ['driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '', 'foreign_key_constraints' => true]]);
    DB::setDefaultConnection('konvitte_migration_test');
    try {
        foreach (glob(database_path('migrations/2026_10_02_2*.php')) as $path) {
            if (str_contains(basename($path), 'konvitte')) (require $path)->up();
        }
        $id = DB::table('konvitte_convites')->insertGetId(['konvitte_invite_type_id' => 1, 'nome_noiva' => 'Ilda', 'nome_noivo' => 'Edilson', 'data' => '2027-06-26 15:00:00', 'local' => 'Maputo', 'foto_capa' => 'old/cover.png', 'musica' => 'old/music.mp3']);
        $tableId = DB::table('konvitte_convite_mesas')->insertGetId(['konvitte_convite_id' => $id, 'nome' => 'Family']);
        $guestId = DB::table('konvitte_convite_convidados')->insertGetId(['konvitte_convite_id' => $id, 'konvitte_convite_mesa_id' => $tableId, 'nome' => 'Leia', 'numero_maximo_convidados' => 3]);
        DB::table('konvitte_convite_slugs')->insert(['konvitte_convite_id' => $id, 'slug' => 'wedding']);
        DB::table('konvitte_convite_guest_slugs')->insert(['konvitte_convite_convidado_id' => $guestId, 'slug' => 'leia']);
        DB::table('konvitte_convite_galleries')->insert(['konvitte_convite_id' => $id, 'path' => 'old/photo.png', 'original_name' => 'Photo.png', 'size' => 123]);
        (require database_path('migrations/2026_10_03_000000_create_english_konvitte_schema_and_files.php'))->up();
        expect(DB::table('konvitte_invitations')->where('id', $id)->value('bride_name'))->toBe('Ilda');
        expect(DB::table('konvitte_guests')->where('id', $guestId)->value('konvitte_table_id'))->toBe($tableId);
        expect(DB::table('konvitte_guest_slugs')->value('slug'))->toBe('leia');
        expect(DB::table('files')->count())->toBe(3)->and(DB::table('konvitte_invitation_file')->count())->toBe(3);
        expect(DB::table('files')->where('path', 'old/photo.png')->value('name'))->toBe('Photo.png');
        expect(Schema::hasTable('konvitte_convites'))->toBeFalse()->and(Schema::hasTable('konvitte_convite_galleries'))->toBeFalse();
        expect(DB::table('files')->where('path', 'old/cover.png')->count())->toBe(1);
        expect(Schema::hasColumn('konvitte_invitations', 'foto_capa'))->toBeFalse();
    } finally {
        DB::setDefaultConnection($original);
        DB::purge('konvitte_migration_test');
    }
});
