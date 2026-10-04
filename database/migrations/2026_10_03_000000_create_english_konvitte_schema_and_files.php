<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    // Copy legacy records before retiring the old Konvitte schema.
    public function up(): void
    {
        Schema::create('files', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('path');
            $table->string('format', 100);
            $table->unsignedBigInteger('size')->nullable();
            $table->timestamps();
        });
        Schema::create('konvitte_invitations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('konvitte_invite_type_id')->constrained()->restrictOnDelete();
            $table->string('bride_name');
            $table->string('groom_name');
            foreach (['groom_father_name', 'groom_mother_name', 'bride_father_name', 'bride_mother_name'] as $name) $table->string($name)->nullable();
            $table->dateTime('event_date');
            $table->string('venue');
            foreach (['bible_text', 'bible_reference', 'couple_text', 'celebration_text', 'instructions'] as $name) $table->text($name)->nullable();
            $table->timestamps();
        });
        Schema::create('konvitte_tables', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('konvitte_invitation_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->timestamps();
            $table->unique(['konvitte_invitation_id', 'name']);
        });
        Schema::create('konvitte_guests', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('konvitte_invitation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('konvitte_table_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->unsignedSmallInteger('max_guests')->default(1);
            $table->timestamps();
        });
        Schema::create('konvitte_invitation_slugs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('konvitte_invitation_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('slug')->unique();
            $table->timestamps();
        });
        Schema::create('konvitte_guest_slugs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('konvitte_guest_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('slug')->unique();
            $table->timestamps();
        });
        Schema::create('konvitte_contacts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('konvitte_invitation_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
        Schema::create('konvitte_program_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('konvitte_invitation_id')->constrained()->cascadeOnDelete();
            $table->string('time', 5);
            $table->string('name');
            $table->string('location')->nullable();
            $table->string('google_maps_link', 500)->nullable();
            $table->string('icon', 40)->default('calendar');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
        Schema::create('konvitte_invitation_file', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('konvitte_invitation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('file_id')->constrained()->restrictOnDelete();
            $table->string('role', 30);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->unique(['konvitte_invitation_id', 'file_id', 'role'], 'konvitte_invitation_file_role_unique');
        });
        DB::transaction(function (): void {
            $this->copy('konvitte_convites', 'konvitte_invitations', [
                'nome_noiva' => 'bride_name', 'nome_noivo' => 'groom_name', 'nome_pai_noivo' => 'groom_father_name',
                'nome_mae_noivo' => 'groom_mother_name', 'nome_pai_noiva' => 'bride_father_name', 'nome_mae_noiva' => 'bride_mother_name',
                'data' => 'event_date', 'local' => 'venue', 'texto_biblico' => 'bible_text', 'livro_biblico' => 'bible_reference',
                'texto_casal' => 'couple_text', 'texto_celebre' => 'celebration_text', 'texto_orientacoes' => 'instructions',
            ], ['foto_capa', 'foto_inicial', 'foto_informacoes', 'musica']);
            $parent = ['konvitte_convite_id' => 'konvitte_invitation_id'];
            $this->copy('konvitte_convite_mesas', 'konvitte_tables', $parent + ['nome' => 'name']);
            $this->copy('konvitte_convite_convidados', 'konvitte_guests', $parent + ['nome' => 'name', 'konvitte_convite_mesa_id' => 'konvitte_table_id', 'numero_maximo_convidados' => 'max_guests']);
            $this->copy('konvitte_convite_slugs', 'konvitte_invitation_slugs', $parent);
            $this->copy('konvitte_convite_guest_slugs', 'konvitte_guest_slugs', ['konvitte_convite_convidado_id' => 'konvitte_guest_id']);
            $this->copy('konvitte_convite_contacts', 'konvitte_contacts', $parent + ['nome' => 'name', 'telefone' => 'phone', 'ordem' => 'sort_order']);
            $this->copy('konvitte_convite_program_items', 'konvitte_program_items', $parent + ['hora' => 'time', 'nome' => 'name', 'localizacao' => 'location', 'ordem' => 'sort_order']);
            DB::table('konvitte_convites')->orderBy('id')->chunkById(100, function ($rows): void {
                foreach ($rows as $row) foreach (['foto_capa' => 'cover', 'foto_inicial' => 'hero', 'foto_informacoes' => 'information', 'musica' => 'music'] as $column => $role) {
                    if ($row->{$column}) $this->attachFile($row->id, $row->{$column}, basename($row->{$column}), null, $role, $row->created_at, $row->updated_at);
                }
            });
            DB::table('konvitte_convite_galleries')->orderBy('id')->chunkById(100, function ($rows): void {
                foreach ($rows as $row) $this->attachFile($row->konvitte_convite_id, $row->path, $row->original_name, $row->size, 'gallery', $row->created_at, $row->updated_at);
            });
        });
        // Remove only the superseded domain tables, in foreign-key dependency order.
        foreach (['konvitte_convite_guest_slugs', 'konvitte_convite_convidados', 'konvitte_convite_mesas', 'konvitte_convite_slugs', 'konvitte_convite_contacts', 'konvitte_convite_program_items', 'konvitte_convite_galleries', 'konvitte_convites'] as $legacyTable) {
            Schema::drop($legacyTable);
        }
    }

    private function copy(string $source, string $target, array $columns, array $omit = []): void
    {
        DB::table($source)->orderBy('id')->chunkById(100, function ($rows) use ($target, $columns, $omit): void {
            foreach ($rows as $row) {
                $values = [];
                foreach ((array)$row as $key => $value) if (!in_array($key, $omit, true)) $values[$columns[$key] ?? $key] = $value;
                DB::table($target)->insert($values);
            }
        });
    }

    private function attachFile(int $invitationId, string $path, string $name, ?int $size, string $role, ?string $created, ?string $updated): void
    {
        $id = DB::table('files')->insertGetId(['name' => $name, 'path' => $path, 'format' => strtolower(pathinfo($path, PATHINFO_EXTENSION)) ?: 'unknown', 'size' => $size, 'created_at' => $created, 'updated_at' => $updated]);
        DB::table('konvitte_invitation_file')->insert(['konvitte_invitation_id' => $invitationId, 'file_id' => $id, 'role' => $role, 'created_at' => $created, 'updated_at' => $updated]);
    }

    public function down(): void
    {
        throw new RuntimeException('This data migration requires an explicit recovery plan; automatic rollback could discard new invitations and files. Use a database backup to recover the previous schema.');
    }
};
