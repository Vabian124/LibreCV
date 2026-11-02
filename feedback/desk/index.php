<?php
declare(strict_types=1);

require __DIR__ . '/../lib.php';

const FB_ASSET = '/styles.css?v=23';

function fb_redirect(string $path): void {
    header('Location: ' . $path, true, 303);
    exit;
}

function fb_flash(string $text, bool $ok = false): void {
    $_SESSION['flash'] = $text;
    $_SESSION['flash_tone'] = $ok ? 'ok' : 'bad';
}

function fb_take_flash(): array {
    $text = (string)($_SESSION['flash'] ?? '');
    $tone = (string)($_SESSION['flash_tone'] ?? 'bad');
    unset($_SESSION['flash'], $_SESSION['flash_tone']);
    return [$text, $tone];
}

function fb_status(string $text, string $tone): string {
    if ($text === '') {
        return '';
    }
    $class = $tone === 'ok' ? 'note' : 'feedback-status is-bad';
    return '<p class="' . $class . '">' . fb_h($text) . '</p>';
}

function fb_layout(string $title, string $body): void {
    header('Content-Type: text/html; charset=UTF-8');
    header('Referrer-Policy: no-referrer');
    echo '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">';
    echo '<meta name="viewport" content="width=device-width, initial-scale=1">';
    echo '<meta name="robots" content="noindex, nofollow, noarchive">';
    echo '<meta name="referrer" content="no-referrer">';
    echo '<title>' . fb_h($title) . '</title>';
    echo '<link rel="icon" href="/favicon.ico" sizes="96x96" type="image/x-icon">';
    echo '<link rel="icon" href="/favicon.png" sizes="96x96" type="image/png">';
    echo '<link rel="icon" href="/favicon.svg" type="image/svg+xml">';
    echo '<link rel="stylesheet" href="' . fb_h(FB_ASSET) . '">';
    echo '</head><body><main class="desk">';
    echo $body;
    echo '</main></body></html>';
    exit;
}

function fb_login(string $error): void {
    $body = '<h1>Feedback inbox</h1>';
    $body .= '<p class="note">This page is not listed on the site.</p>';
    if ($error !== '') {
        $body .= '<p class="feedback-status is-bad">' . fb_h($error) . '</p>';
    }
    $body .= '<form class="desk-card" method="post" action="/feedback/desk/" autocomplete="on">';
    $body .= '<input type="hidden" name="csrf" value="' . fb_h((string)$_SESSION['csrf']) . '">';
    $body .= '<input type="hidden" name="action" value="login">';
    $body .= '<label class="feedback-field">Name<input name="user" autocomplete="username" value="librecv"></label>';
    $body .= '<label class="feedback-field">Password<input type="password" name="password" autocomplete="current-password" maxlength="200" required autofocus></label>';
    $body .= '<button class="btn-primary" type="submit">Sign in</button>';
    $body .= '</form>';
    fb_layout('Feedback inbox', $body);
}

function fb_csv_cell(string $value): string {
    if (preg_match('/^[=+\-@\t\r]/', $value) === 1) {
        $value = "'" . $value;
    }
    return '"' . str_replace('"', '""', $value) . '"';
}

function fb_preview(string $message): string {
    $line = preg_replace('/\s+/', ' ', trim($message)) ?? '';
    if (fb_len($line) > 120) {
        $line = fb_clip($line, 120) . '…';
    }
    return $line;
}

try {
    fb_quiet();
    header('Referrer-Policy: no-referrer');
    fb_session();
    $db = fb_db();

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
        if (!fb_csrf_ok()) {
            fb_flash('That form expired. Try again.');
            fb_redirect('/feedback/desk/');
        }
        $action = (string)($_POST['action'] ?? '');
        if ($action === 'login') {
            $bucket = 'login|' . fb_ip();
            if (fb_hits($bucket, 900) >= 8) {
                fb_flash('Too many attempts. Wait a few minutes.');
                fb_redirect('/feedback/desk/');
            }
            $password = (string)($_POST['password'] ?? '');
            if (strlen($password) > 200) {
                $password = '';
            }
            $ok = password_verify($password, fb_config()['password_hash']);
            if (!$ok) {
                fb_hit($bucket);
                fb_flash('That password did not match.');
                fb_redirect('/feedback/desk/');
            }
            session_regenerate_id(true);
            $_SESSION['desk'] = 1;
            $_SESSION['desk_at'] = time();
            $_SESSION['csrf'] = bin2hex(random_bytes(16));
            fb_redirect('/feedback/desk/');
        }
        if ($action === 'logout') {
            $_SESSION = [];
            if (ini_get('session.use_cookies')) {
                $params = session_get_cookie_params();
                setcookie(session_name(), '', [
                    'expires' => time() - 42000,
                    'path' => (string)$params['path'],
                    'domain' => (string)$params['domain'],
                    'secure' => true,
                    'httponly' => true,
                    'samesite' => 'Strict',
                ]);
            }
            session_destroy();
            fb_redirect('/feedback/desk/');
        }
        if (!fb_logged_in()) {
            fb_redirect('/feedback/desk/');
        }
        $id = (int)($_POST['id'] ?? 0);
        if (($action === 'close' || $action === 'reopen') && $id > 0) {
            $status = $action === 'close' ? 'closed' : 'open';
            $db->prepare('UPDATE notes SET status = ? WHERE id = ?')->execute([$status, $id]);
            fb_redirect('/feedback/desk/?id=' . $id);
        }
        if ($action === 'delete' && $id > 0) {
            $db->prepare('DELETE FROM notes WHERE id = ?')->execute([$id]);
            fb_flash('That note was deleted.', true);
            fb_redirect('/feedback/desk/');
        }
        if ($action === 'delete-all') {
            $db->exec('DELETE FROM notes');
            fb_flash('Every note was deleted.', true);
            fb_redirect('/feedback/desk/');
        }
        fb_redirect('/feedback/desk/');
    }

    if (!fb_logged_in()) {
        [$loginError] = fb_take_flash();
        fb_login($loginError);
    }

    if (isset($_GET['download'])) {
        $format = (string)$_GET['download'];
        $rows = $db->query('SELECT id, created, status, kind, message, email, page, lang, ua, context FROM notes ORDER BY id ASC')->fetchAll();
        if ($format === 'json') {
            header('Content-Type: application/json; charset=UTF-8');
            header('Content-Disposition: attachment; filename="librecv-feedback.json"');
            echo json_encode($rows, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG);
            exit;
        }
        if ($format === 'csv') {
            header('Content-Type: text/csv; charset=UTF-8');
            header('Content-Disposition: attachment; filename="librecv-feedback.csv"');
            echo "\xEF\xBB\xBF";
            $columns = ['id', 'created', 'status', 'kind', 'message', 'email', 'page', 'lang', 'ua', 'context'];
            echo implode(',', $columns) . "\n";
            foreach ($rows as $row) {
                $cells = [];
                foreach ($columns as $column) {
                    $value = $column === 'created' ? gmdate('c', (int)$row['created']) : (string)$row[$column];
                    $cells[] = fb_csv_cell($value);
                }
                echo implode(',', $cells) . "\n";
            }
            exit;
        }
        fb_redirect('/feedback/desk/');
    }

    [$flash, $flashTone] = fb_take_flash();
    $noteId = (int)($_GET['id'] ?? 0);
    if ($noteId > 0) {
        $stmt = $db->prepare('SELECT * FROM notes WHERE id = ?');
        $stmt->execute([$noteId]);
        $note = $stmt->fetch();
        if (!$note) {
            fb_layout('Feedback inbox', '<h1>Feedback inbox</h1><p>That note is not here.</p><p><a href="/feedback/desk/">Back</a></p>');
        }
        $body = '<div class="desk-bar"><a href="/feedback/desk/">All open</a></div>';
        $body .= '<h1>' . fb_h(fb_kind_label((string)$note['kind'])) . '</h1>';
        $body .= '<p class="note">' . fb_h(fb_when((int)$note['created'])) . ' · ' . fb_h((string)$note['status']);
        if ((string)$note['email'] !== '') {
            $body .= ' · ' . fb_h((string)$note['email']);
        }
        $body .= '</p>';
        $body .= fb_status($flash, $flashTone);
        $body .= '<article class="desk-card"><pre>' . fb_h((string)$note['message']) . '</pre></article>';
        $details = [];
        foreach (['page' => 'Page', 'lang' => 'Language', 'ua' => 'Browser'] as $key => $label) {
            if ((string)$note[$key] !== '') {
                $details[] = '<p><strong>' . fb_h($label) . '</strong><br>' . fb_h((string)$note[$key]) . '</p>';
            }
        }
        $context = json_decode((string)$note['context'], true);
        if (is_array($context)) {
            if (!empty($context['viewport']) && is_string($context['viewport'])) {
                $details[] = '<p><strong>Window</strong><br>' . fb_h($context['viewport']) . '</p>';
            }
            if (!empty($context['docKind']) && is_string($context['docKind'])) {
                $details[] = '<p><strong>Document</strong><br>' . fb_h($context['docKind']) . '</p>';
            }
            if (!empty($context['marked']) && is_string($context['marked'])) {
                $details[] = '<p><strong>Document text</strong></p><pre>' . fb_h($context['marked']) . '</pre>';
            }
        }
        if ($details) {
            $body .= '<div class="desk-card">' . implode('', $details) . '</div>';
        }
        $next = (string)$note['status'] === 'open' ? 'close' : 'reopen';
        $nextLabel = $next === 'close' ? 'Close' : 'Open again';
        if (isset($_GET['erase'])) {
            $body .= '<div class="desk-card"><p>This deletes the note, the email address, and any document text. It cannot be undone.</p>';
            $body .= '<form method="post" action="/feedback/desk/">';
            $body .= '<input type="hidden" name="csrf" value="' . fb_h((string)$_SESSION['csrf']) . '">';
            $body .= '<input type="hidden" name="action" value="delete">';
            $body .= '<input type="hidden" name="id" value="' . (int)$note['id'] . '">';
            $body .= '<button class="btn" type="submit">Delete permanently</button>';
            $body .= '</form>';
            $body .= '<p><a href="/feedback/desk/?id=' . (int)$note['id'] . '">Keep it</a></p></div>';
        } else {
            $body .= '<form method="post" action="/feedback/desk/" class="desk-bar">';
            $body .= '<input type="hidden" name="csrf" value="' . fb_h((string)$_SESSION['csrf']) . '">';
            $body .= '<input type="hidden" name="action" value="' . $next . '">';
            $body .= '<input type="hidden" name="id" value="' . (int)$note['id'] . '">';
            $body .= '<button class="btn" type="submit">' . $nextLabel . '</button>';
            $body .= '</form>';
            $body .= '<p class="note">Closing keeps the note. <a href="/feedback/desk/?id=' . (int)$note['id'] . '&amp;erase=1">Delete</a> removes it from this inbox.</p>';
        }
        fb_layout('Note ' . (int)$note['id'], $body);
    }

    $show = (string)($_GET['show'] ?? 'open');
    if (!in_array($show, ['open', 'closed', 'all'], true)) {
        $show = 'open';
    }
    if ($show === 'all') {
        $count = (int)$db->query('SELECT COUNT(*) FROM notes')->fetchColumn();
        $rows = $db->query('SELECT id, created, status, kind, message, email FROM notes ORDER BY id DESC LIMIT 200')->fetchAll();
    } else {
        $countStmt = $db->prepare('SELECT COUNT(*) FROM notes WHERE status = ?');
        $countStmt->execute([$show]);
        $count = (int)$countStmt->fetchColumn();
        $rowsStmt = $db->prepare('SELECT id, created, status, kind, message, email FROM notes WHERE status = ? ORDER BY id DESC LIMIT 200');
        $rowsStmt->execute([$show]);
        $rows = $rowsStmt->fetchAll();
    }
    $open = (int)$db->query("SELECT COUNT(*) FROM notes WHERE status = 'open'")->fetchColumn();
    $total = (int)$db->query('SELECT COUNT(*) FROM notes')->fetchColumn();
    $body = '<div class="desk-bar">';
    $body .= '<a href="/feedback/desk/">Open</a>';
    $body .= '<a href="/feedback/desk/?show=closed">Closed</a>';
    $body .= '<a href="/feedback/desk/?show=all">All</a>';
    $body .= '<a class="btn" href="/feedback/desk/?download=json">Download JSON</a>';
    $body .= '<a class="btn" href="/feedback/desk/?download=csv">Download CSV</a>';
    if ($total > 0) {
        $body .= '<a href="/feedback/desk/?erase=all">Delete all</a>';
    }
    $body .= '<form method="post" action="/feedback/desk/">';
    $body .= '<input type="hidden" name="csrf" value="' . fb_h((string)$_SESSION['csrf']) . '">';
    $body .= '<input type="hidden" name="action" value="logout">';
    $body .= '<button class="btn" type="submit">Sign out</button>';
    $body .= '</form></div>';
    $body .= '<h1>Feedback inbox</h1>';
    $body .= '<p class="note">' . $open . ' open. Delete a note to remove its text from this inbox.</p>';
    $body .= fb_status($flash, $flashTone);
    if ((string)($_GET['erase'] ?? '') === 'all' && $total > 0) {
        $body .= '<div class="desk-card"><p>This deletes every note, every email address, and any document text. It cannot be undone.</p>';
        $body .= '<form method="post" action="/feedback/desk/">';
        $body .= '<input type="hidden" name="csrf" value="' . fb_h((string)$_SESSION['csrf']) . '">';
        $body .= '<input type="hidden" name="action" value="delete-all">';
        $body .= '<button class="btn" type="submit">Delete all notes</button>';
        $body .= '</form>';
        $body .= '<p><a href="/feedback/desk/">Keep them</a></p></div>';
    }
    if (!$rows) {
        $body .= '<p>No notes here.</p>';
    } else {
        $body .= '<div class="desk-list"><table><thead><tr><th>When</th><th>Kind</th><th>Note</th></tr></thead><tbody>';
        foreach ($rows as $row) {
            $body .= '<tr><td>' . fb_h(fb_when((int)$row['created'])) . '</td>';
            $body .= '<td>' . fb_h(fb_kind_label((string)$row['kind'])) . '</td>';
            $body .= '<td><a href="/feedback/desk/?id=' . (int)$row['id'] . '">' . fb_h(fb_preview((string)$row['message'])) . '</a>';
            if ((string)$row['email'] !== '') {
                $body .= '<br><span class="note">' . fb_h((string)$row['email']) . '</span>';
            }
            $body .= '</td></tr>';
        }
        $body .= '</tbody></table></div>';
        if ($count > 200) {
            $body .= '<p class="note">This list shows the latest 200. Download has all of them.</p>';
        }
    }
    fb_layout('Feedback inbox', $body);
} catch (Throwable $e) {
    error_log('librecv feedback desk failed');
    http_response_code(500);
    fb_quiet();
    header('Content-Type: text/plain; charset=UTF-8');
    echo 'The inbox did not open.';
}
