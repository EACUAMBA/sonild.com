<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('konvitte_convite_guest_slugs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('konvitte_convite_convidado_id')->unique('konvitte_guest_slugs_guest_unique')->constrained('konvitte_convite_convidados', indexName: 'konvitte_guest_slugs_guest_fk')->cascadeOnDelete();
            $table->string('slug')->unique();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('konvitte_convite_guest_slugs');
    }
};
