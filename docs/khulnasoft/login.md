## khulnasoft-login

Connect the Khulnasoft CLI to your Khulnasoft account by logging in with your [personal access token](https://khulnasoft.com/dashboard/account/tokens).

Your access token is stored securely in [native credentials storage](https://github.com/zalando/go-keyring#dependencies). If native credentials storage is unavailable, it will be written to a plain text file at `~/.khulnasoft/access-token`.

> If this behavior is not desired, such as in a CI environment, you may skip login by specifying the `KHULNASOFT_ACCESS_TOKEN` environment variable in other commands.

The Khulnasoft CLI uses the stored token to access Management APIs for projects, functions, secrets, etc.
