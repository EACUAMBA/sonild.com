<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('permissions', function (Blueprint $table) {
            $table->string('module')->default('Geral')->index();
        });

        DB::table('permissions')->where('scope', 'backoffice')
            ->whereIn('resource', ['user', 'usergroup', 'permission'])
            ->update(['module' => 'ACL']);

        DB::table('permissions')->where('scope', 'konvitte')
            ->where('resource', 'event')->update(['module' => 'Eventos']);
    }

    public function down(): void
    {
        Schema::table('permissions', function (Blueprint $table) {
            $table->dropIndex(['module']);
            $table->dropColumn('module');
        });
    }
};
