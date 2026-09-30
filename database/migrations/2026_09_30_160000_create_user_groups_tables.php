<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('user_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->timestamps();
        });

        Schema::create('usergroup_permission', function (Blueprint $table) {
            $table->foreignId('usergroup_id')->constrained('user_groups')->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained()->cascadeOnDelete();
            $table->primary(['usergroup_id', 'permission_id']);
        });

        Schema::create('usergroup_user', function (Blueprint $table) {
            $table->foreignId('usergroup_id')->constrained('user_groups')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->primary(['usergroup_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usergroup_user');
        Schema::dropIfExists('usergroup_permission');
        Schema::dropIfExists('user_groups');
    }
};
