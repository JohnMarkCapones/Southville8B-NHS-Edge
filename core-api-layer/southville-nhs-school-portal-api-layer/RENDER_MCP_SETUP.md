# Render MCP Setup Guide

This guide will help you set up Render MCP (Model Context Protocol) in Cursor to manage your Render deployments directly from the IDE.

## Prerequisites

- Render account
- Cursor IDE
- Render API key

## Step 1: Create Render API Key

1. Go to [Render Account Settings](https://dashboard.render.com/account/settings)
2. Scroll to **API Keys** section
3. Click **Create API Key**
4. Give it a descriptive name (e.g., "Cursor MCP")
5. **Copy and securely store the API key** - you won't be able to see it again!

⚠️ **Important**: This API key grants access to all your Render workspaces and services. Keep it secure!

## Step 2: Configure Cursor MCP

1. Open Cursor IDE
2. Go to **Settings** → **Features** → **MCP**
3. Click **+ Add New MCP Server**
4. Fill in the configuration:
   - **Name**: `Render MCP`
   - **Type**: `Streamable HTTP`
   - **URL**: `https://mcp.render.com/mcp`
   - **Headers**: 
     - Key: `Authorization`
     - Value: `Bearer YOUR_API_KEY` (replace `YOUR_API_KEY` with your actual API key)

5. Click **Save**

## Step 3: Set Your Render Workspace

After configuring the MCP server, you need to tell Cursor which Render workspace to use:

1. In Cursor's chat interface, type:
   ```
   Set my Render workspace to [YOUR_WORKSPACE_NAME]
   ```
   Replace `[YOUR_WORKSPACE_NAME]` with your actual Render workspace name.

2. You can find your workspace name in the Render dashboard URL or in your account settings.

## Step 4: Verify Setup

Test the MCP connection by asking Cursor:
- "List my Render services"
- "Show my Render workspaces"

If it works, you'll see your Render services listed!

## Using Render MCP Commands

Once set up, you can use natural language commands in Cursor to:

### Service Management
- "List my Render services"
- "Show details for service 'southville-nhs-api'"
- "Deploy my service named 'southville-nhs-api'"
- "Restart my 'southville-nhs-api' service"

### Logs & Monitoring
- "Show logs for my 'southville-nhs-api' service"
- "Show recent logs for 'southville-nhs-api'"
- "Show deployment history for 'southville-nhs-api'"

### Environment Variables
- "List environment variables for 'southville-nhs-api'"
- "Add environment variable SUPABASE_URL to 'southville-nhs-api'"
- "Update environment variable PORT for 'southville-nhs-api'"

### Deployments
- "Trigger a new deployment for 'southville-nhs-api'"
- "Show deployment status for 'southville-nhs-api'"
- "Rollback 'southville-nhs-api' to previous deployment"

## Troubleshooting

### MCP Server Not Connecting
- Verify your API key is correct
- Check that the URL is exactly: `https://mcp.render.com/mcp`
- Ensure the Authorization header format is: `Bearer YOUR_API_KEY` (with space after Bearer)

### Workspace Not Found
- Verify your workspace name is correct
- Check that your API key has access to the workspace
- Try listing workspaces first: "List my Render workspaces"

### Commands Not Working
- Make sure you've set your workspace first
- Verify the service name matches exactly (case-sensitive)
- Check that the MCP server is enabled in Cursor settings

## Security Best Practices

1. **Never commit your API key** to version control
2. **Use environment variables** or Cursor's secure storage for the API key
3. **Rotate API keys** regularly
4. **Use least privilege** - create API keys with minimal required permissions if possible
5. **Revoke unused keys** immediately

## Next Steps

After setting up Render MCP, you can:
1. Deploy your service directly from Cursor
2. Monitor logs and deployments
3. Manage environment variables
4. Trigger deployments on demand

## References

- [Render MCP Server Documentation](https://render.com/docs/mcp-server)
- [Cursor MCP Guide](https://docs.cursor.com/advanced/model-context-protocol)
- [Render API Documentation](https://render.com/docs/api)


