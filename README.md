# MAM Tours

MAM Tours is intended to be a Laravel car-rental management application.

## Repository status: not production ready

The current repository snapshot contains dependency manifests and deployment scaffolding, but it does **not** contain the Laravel application source or test suite. Missing items include `app/`, `bootstrap/app.php`, `routes/`, `database/migrations/`, `resources/`, and `public/index.php`. The required application code is not present in the earlier Git commit either.

The Railway build guard is expected to fail until the actual application source is restored from a trusted backup or the correct repository. Do not deploy this snapshot.

## Security notice

A populated `.env` file was committed previously and has since been removed from the current tree. Its contents remain in Git history. Rotate any real credentials it contained—including the application key and payment or messaging credentials—at the relevant providers. Put replacement secrets in Railway variables or a secrets manager; do not commit them. Coordinate any Git history rewrite after rotating the secrets.

## Framework status

`composer.json` currently requires Laravel 8. Laravel's official support table lists the end of security fixes for Laravel 8 as 24 January 2023. Restore the source, then upgrade the framework and its dependencies to supported, compatible versions before production.

- [Laravel 8 release and support policy](https://laravel.com/framework/docs/8.x/releases)
- [Laravel 8 deployment guidance](https://laravel.com/framework/docs/8.x/deployment)

## Railway deployment

See [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) for the current blocker, credential actions, and the deployment checklist to follow after restoring the application.

No production environment values, database migrations, live payment credentials, or test results are included in this repository snapshot.