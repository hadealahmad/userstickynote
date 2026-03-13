<?php

namespace App\Console\Commands;

use App\Models\Note;
use Illuminate\Console\Command;

class PruneDeletedNotes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notes:prune';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Permanently delete soft-deleted notes older than 30 days';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $count = Note::onlyTrashed()
            ->where('deleted_at', '<', now()->subDays(30))
            ->forceDelete();

        $this->info("Successfully pruned {$count} deleted notes.");
    }
}
