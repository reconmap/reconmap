# API Tokens

API tokens allow you to interact with the Reconmap API programmatically without needing a short-lived JWT (JSON Web Token). These are ideal for scripts, CI/CD integrations, and automation.

## Managing API Tokens

You can manage your API tokens by navigating to **System > API tokens** in the dashboard.

### Creating a Token

1. Click the **Create token** button.
2. Provide a descriptive **Name** for the token.
3. Set the **Expiration** period in days.
4. Select the **Scope**:
   - **Full scope**: Full access to all resources allowed by your user role.
   - **Read-only**: Restricted to `GET`, `HEAD`, and `OPTIONS` requests.
5. Click **Create**.
6. **Important**: Copy the generated token immediately. It will only be shown once for security reasons.

### Revoking a Token

If a token is compromised or no longer needed, you can delete it from the API Tokens list. Once deleted, any requests using that token will be rejected.

## Using the Token

Include the token in the `Authorization` header of your HTTP requests as a `Bearer` token.

### Example with cURL

```bash
curl -X GET "https://api.reconmap.example.com/api/projects" \
     -H "Authorization: Bearer <your_api_token>" \
     -H "Accept: application/json"
```

## Security Best Practices

- **Never** share your API tokens or commit them to source control.
- Use **Read-only** tokens whenever possible to minimize risk.
- Set short expiration dates for temporary tasks.
- Revoke tokens immediately if you suspect they have been leaked.
