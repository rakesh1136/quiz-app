<?php

namespace App\Http\Responses\Concerns;

use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

trait RedirectsToCurrentTeam
{
    protected function redirectPathForCurrentTeam(Request $request, string $redirect): string
    {
        $team = $this->currentTeam($request);

        URL::defaults(['current_team' => $team->slug]);

        return "/{$team->slug}{$redirect}";
    }

    protected function redirectAfterAuthentication(Request $request, string $fallbackPath): RedirectResponse
    {
        $intended = $request->session()->pull('url.intended');

        if ($this->isAllowedIntendedUrl($intended)) {
            return redirect()->to($intended);
        }

        return redirect()->to($fallbackPath);
    }

    protected function isAllowedIntendedUrl(?string $url): bool
    {
        if (! is_string($url) || $url === '') {
            return false;
        }

        $path = parse_url($url, PHP_URL_PATH) ?? '/';

        return ! str_starts_with($path, '/admin');
    }

    protected function currentTeam(Request $request): Team
    {
        $user = $request->user();

        abort_if(! $user, 403);

        $team = $user->currentTeam ?? $user->personalTeam();

        abort_if(! $team, 403);

        return $team;
    }
}
