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
            ['title' => 'Pelajari custom Nav router'],
            ['title' => 'Bandinkan x-if vs Alpine.data'],
            ['title' => 'Rapikan design tokens shadcn'],
        ]);

        $admin->notes()->createMany([
            ['title' => 'Siapkan demo untuk tim'],
            ['title' => 'Review README arsitektur'],
        ]);
    }
}
