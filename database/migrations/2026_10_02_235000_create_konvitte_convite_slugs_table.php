<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('konvitte_convite_slugs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('konvitte_convite_id')->unique()->constrained('konvitte_convites')->cascadeOnDelete();
            $table->string('slug')->unique();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('konvitte_convite_slugs');
    }
};
