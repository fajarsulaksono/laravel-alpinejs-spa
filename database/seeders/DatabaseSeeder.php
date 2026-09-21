<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // level 'admin'  -> setelah login mendarat di bagian panel (vanilla JS)
        // level 'member' -> setelah login mendarat di bagian member (AlpineJS)
        $admin = User::factory()->create([
            'name' => 'Rina Admin',
            'email' => 'admin@example.com',
            'level' => 'admin',
        ]);

        $member = User::factory()->create([
            'name' => 'Doni Member',
            'email' => 'member@example.com',
            'level' => 'member',
        ]);

        $member->notes()->createMany([
            ['title' => 'Study the custom Nav router'],
            ['title' => 'Compare x-if vs Alpine.data'],
            ['title' => 'Clean up the shadcn design tokens'],
        ]);

        $admin->notes()->createMany([
            ['title' => 'Prepare the demo for the team'],
            ['title' => 'Review the architecture README'],
        ]);
    }
}
