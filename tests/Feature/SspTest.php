<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SspTest extends TestCase
{
    use RefreshDatabase;

    public function test_setiap_subroute_mengembalikan_shell_yang_sama(): void
    {
        $this->withoutVite();

        foreach (['/', '/login', '/panel/', '/panel/notes', '/member/'] as $path) {
            $this->get($path)
                ->assertOk()
                ->assertSee('window.CFG', false)
                ->assertSee('id="panel"', false)
                ->assertSee('id="member"', false);
        }
    }

    public function test_admin_mendarat_di_panel(): void
    {
        $user = User::factory()->create(['level' => 'admin']);

        $this->post('/api/login', ['email' => $user->email, 'password' => 'password'])
            ->assertOk()
            ->assertJsonPath('data.user.level', 'admin');

        $this->post('/api/logout')->assertOk();
    }

    public function test_siklus_catatan_lengkap(): void
    {
        $user = User::factory()->create(['level' => 'member']);

        $this->post('/api/login', ['email' => $user->email, 'password' => 'password'])->assertOk();

        $created = $this->post('/api/notes', ['title' => 'Catatan tes'])->assertCreated()->json('data');

        $this->assertSame('Catatan tes', $created['title']);
        $this->assertFalse($created['done']);

        $this->post("/api/notes/{$created['id']}/toggle")
            ->assertOk()
            ->assertJsonPath('data.done', true);

        $this->get('/api/state')->assertJsonPath('data.notes.0.done', true);

        $this->delete("/api/notes/{$created['id']}")->assertOk();
        $this->assertDatabaseMissing('notes', ['id' => $created['id']]);
    }

    public function test_tidak_bisa_mengubah_catatan_orang_lain(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create(['level' => 'member']);
        $note = $owner->notes()->create(['title' => 'Punya pemilik']);

        $this->post('/api/login', ['email' => $other->email, 'password' => 'password'])->assertOk();

        $this->post("/api/notes/{$note->id}/toggle")->assertForbidden();
    }
}