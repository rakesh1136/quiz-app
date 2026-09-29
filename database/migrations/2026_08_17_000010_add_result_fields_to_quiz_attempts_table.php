<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->unsignedInteger('total_questions')->nullable()->after('completed_at');
            $table->unsignedInteger('attempted_questions')->nullable()->after('total_questions');
            $table->unsignedInteger('correct_answers')->nullable()->after('attempted_questions');
            $table->unsignedInteger('wrong_answers')->nullable()->after('correct_answers');
            $table->unsignedInteger('unanswered_questions')->nullable()->after('wrong_answers');
            $table->decimal('total_marks', 8, 2)->nullable()->after('unanswered_questions');
            $table->boolean('is_passed')->nullable()->after('percentage');
        });
    }

    public function down(): void
    {
        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->dropColumn([
                'total_questions',
                'attempted_questions',
                'correct_answers',
                'wrong_answers',
                'unanswered_questions',
                'total_marks',
                'is_passed',
            ]);
        });
    }
};
