<?php

namespace App\Providers;

use Illuminate\Foundation\Console\ServeCommand;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Windows' development server needs a writable location to buffer large JSON bodies.
        if (PHP_OS_FAMILY !== 'Windows' || ! in_array('serve', $_SERVER['argv'] ?? [], true)) {
            return;
        }

        $temporaryDirectory = storage_path('framework/tmp');
        if (! is_dir($temporaryDirectory)) {
            mkdir($temporaryDirectory, 0775, true);
        }

        foreach (['TEMP', 'TMP', 'TMPDIR'] as $name) {
            $_ENV[$name] = $temporaryDirectory;
            $_SERVER[$name] = $temporaryDirectory;
            putenv($name.'='.$temporaryDirectory);
            ServeCommand::$passthroughVariables[] = $name;
        }
    }
}
