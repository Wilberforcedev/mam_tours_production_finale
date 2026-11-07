# Production readiness and Railway deployment

## Current status: blocked

This repository is not a deployable Laravel application. The current Git tree contains the Composer and frontend manifests plus deployment documentation, but no application source:

- `app/`
- `bootstrap/app.php`
- `routes/`
- `database/migrations/`
- `resources/`
- `public/index.php`
- application tests

The build configuration deliberately stops when the required Laravel source is missing. Keep that guard in place. Restore the real application from a trusted backup or the correct repository before attempting deployment. The earlier Git commit does not contain the missing source either.

## Security actions required

The committed `.env` file has been removed from the current snapshot, but it remains in Git history. Treat every real value it contained as exposed:

1. Rotate the Laravel `APP_KEY` and any real payment, database, mail, SMS, or cloud credentials in their respective provider dashboards.
2. Store replacement values only as Railway service variables or another secrets manager. Never commit `.env` or credentials.
3. Coordinate any Git history rewrite with collaborators after rotation. Rewriting history does not replace rotating the secrets.

## Framework upgrade required

The manifest currently pins Laravel 8. The Laravel support table lists its security-fix end date as 24 January 2023. Do not launch this version as a new production service. After restoring the application source, upgrade it to a supported Laravel release and compatible PHP/dependency versions, resolving and testing breaking changes in stages.

See the [Laravel release support policy](https://laravel.com/framework/docs/8.x/releases).

## Steps after the application source is restored

1. **Reconcile the project.** Confirm `composer.json`, `composer.lock`, PHP version, extensions, frontend dependencies, migrations, and deployment settings match the restored code.
2. **Build and test before deployment.** Run Composer and npm installs from the lock files, build assets, run the application test suite, and fix static-analysis and security-audit findings. Add CI so these checks run before deployment. The current snapshot has no application tests.
3. **Configure secrets in Railway.** Set `APP_ENV=production`, `APP_DEBUG=false`, `APP_KEY`, the production `APP_URL`, and the database, mail, and payment variables actually required by the restored code. Use Railway's private database reference variables where appropriate. Do not use example values.
4. **Use a production web server.** Route web requests to Laravel's `public/index.php` only. Confirm Railway's current Railpack build plan and start command; do not assume the existing `nixpacks.toml` or `Procfile` is being applied as intended. Laravel's documented web-server configuration uses the `public/` directory as the document root.
5. **Run migrations as a pre-deploy operation.** Review the migrations and verify a restorable database backup first. Use Railway's pre-deploy command for reviewed migrations, for example `php artisan migrate --force`. Do not put migrations in the web-server start command. Never run `migrate:fresh` against a persistent database.
6. **Configure runtime needs.** Decide how sessions, cache, queues, scheduled tasks, uploaded files, and logs will work across restarts and multiple instances. Use durable storage or object storage for user uploads; do not rely on an ephemeral container filesystem.
7. **Add readiness and recovery checks.** Implement a health endpoint that returns a success response only when the app can serve traffic; configure Railway's health check against it. Test database backup restoration and rollback procedures in staging.
8. **Deploy to staging first.** Exercise registration, authentication, booking, payment callbacks, notifications, admin access, and error handling using test credentials. Review logs and security settings before any production launch.

Railway runs pre-deploy commands before the new version goes live and supports health checks; configure these only after the application and health endpoint exist. See [Railway pre-deploy commands](https://docs.railway.com/deployments/pre-deploy-command) and [Railway health checks](https://docs.railway.com/deployments/healthchecks).

## Do not deploy this snapshot

Until the Laravel source is restored, the framework is upgraded, exposed credentials are rotated, and staging checks pass, this repository is not production ready.