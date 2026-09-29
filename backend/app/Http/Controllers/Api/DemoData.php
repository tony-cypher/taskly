<?php

namespace App\Http\Controllers\Api;

use App\Models\AppNotification;
use App\Models\Board;
use App\Models\Event;
use App\Models\Note;
use App\Models\Task;
use App\Models\User;
use Carbon\CarbonImmutable;

class DemoData
{
    public static function seed(User $user): void
    {
        $work = Board::create([
            'user_id' => $user->id,
            'name' => 'Work',
            'color' => 'violet',
            'position' => 0,
        ]);

        $personal = Board::create([
            'user_id' => $user->id,
            'name' => 'Personal',
            'color' => 'green',
            'position' => 1,
        ]);

        $now = CarbonImmutable::now();

        // [title, description, board, priority, category, tag, progress, due_at, remind_at, completed]
        $tasks = [
            ['Conduct research', 'Gather insights for the packaging concept', $work->id, 'high', 'Motion design', 'Logo', 100, $now->addDays(2)->setTime(18, 0), $now->addDays(2)->setTime(9, 0), false],
            ['Schedule a meeting', 'Align with the product team on scope', $work->id, 'medium', 'Design', 'Meeting', 50, $now->addDays(3)->setTime(16, 0), null, false],
            ['Send out reminders', 'Remind everyone about Friday reviews', $work->id, 'low', 'Admin', 'Email', 10, $now->addDays(4)->setTime(11, 0), null, false],
            ['Design a packaging concept for a new product', 'First draft of the box + label direction', $work->id, 'high', 'Motion design', 'Logo', 0, $now->addDay()->setTime(18, 0), $now->addDay()->setTime(9, 0), false],
            ['Grocery run', null, $personal->id, 'low', 'Home', null, 0, $now->addDay()->setTime(17, 0), null, false],
            ['Book dentist appointment', null, $personal->id, 'medium', 'Health', null, 0, $now->addDays(5)->setTime(9, 0), null, false],
            ['Review design feedback', null, $work->id, 'medium', 'Design', 'Review', 100, $now->subDay()->setTime(15, 0), null, true],
            ['Set up project board', null, $work->id, 'low', 'Admin', 'Setup', 100, $now->subDays(2)->setTime(10, 0), null, true],
        ];

        foreach ($tasks as $i => $t) {
            Task::create([
                'user_id' => $user->id,
                'board_id' => $t[2],
                'title' => $t[0],
                'description' => $t[1],
                'completed' => $t[9],
                'priority' => $t[3],
                'category' => $t[4],
                'tag' => $t[5],
                'progress' => $t[6],
                'due_at' => $t[7],
                'remind_at' => $t[8],
                'position' => $i,
            ]);
        }

        // [title, description, location, category, starts_at, ends_at, status]
        $events = [
            ['Team meeting', 'Weekly sync with the design team', 'Zoom', 'Design', $now->setTime(13, 0), $now->setTime(13, 45), 'accepted'],
            ['Meeting with new client', 'Intro call about the rebrand project', 'Google Meet', 'Client', $now->setTime(15, 0), $now->setTime(15, 30), 'pending'],
            ['Board meeting', 'Q3 planning with James, Sara and Tom', 'Office / Room 4B', 'Planning', $now->addDays(2)->setTime(11, 0), $now->addDays(2)->setTime(12, 0), 'pending'],
            ['Design review', 'Packaging concepts walkthrough', 'Figma', 'Design', $now->addDays(3)->setTime(10, 0), $now->addDays(3)->setTime(11, 0), 'accepted'],
        ];

        foreach ($events as $e) {
            Event::create([
                'user_id' => $user->id,
                'title' => $e[0],
                'description' => $e[1],
                'location' => $e[2],
                'category' => $e[3],
                'starts_at' => $e[4],
                'ends_at' => $e[5],
                'status' => $e[6],
            ]);
        }

        // [type, title, body, scheduled_at, read]
        $notifications = [
            ['event', 'Upcoming event', 'Upcoming design meeting', $now->setTime(10, 30), false],
            ['message', 'Message: Product design', 'Hey! Can you review the latest design file before Friday?', $now->subHour(), false],
            ['reminder', 'Packaging design', 'Concept first draft is due tomorrow', $now->subHours(3), true],
            ['event', 'Design review', 'Walkthrough starts in 30 minutes', $now->addHours(2), false],
        ];

        foreach ($notifications as $n) {
            AppNotification::create([
                'user_id' => $user->id,
                'type' => $n[0],
                'title' => $n[1],
                'body' => $n[2],
                'scheduled_at' => $n[3],
                'read_at_flag' => $n[4],
            ]);
        }

        self::seedNotes($user);
    }

    public static function seedNotes(User $user): void
    {
        // [title, body, color, pinned]
        $notes = [
            ['Welcome to Taskly', "This is your notes tab.\n\nCapture ideas, meeting minutes and to-dos that don't fit anywhere else. Click a note to edit it, pin the ones you need daily.", 'violet', true],
            ['Packaging concept — first thoughts', "- Bold matte finish\n- Minimal typography, serif logo lockup\n- Recyclable kraft option to cost with vendor\n\nAsk Tom for print quotes before Friday.", 'amber', false],
            ['Client call notes', "Rebrand kickoff (Google Meet):\n\n• Audience: 25-40, design-conscious\n• Tone: confident, warm\n• Deliverables: logo refresh + packaging\n• Timeline: 6 weeks, review each Friday", 'green', false],
            ['Groceries', "Oat milk\nSourdough\nTomatoes\nCoffee beans", 'slate', false],
        ];

        foreach ($notes as $n) {
            Note::create([
                'user_id' => $user->id,
                'title' => $n[0],
                'body' => $n[1],
                'color' => $n[2],
                'pinned' => $n[3],
            ]);
        }
    }
}
