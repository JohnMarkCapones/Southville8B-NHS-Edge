using System.ComponentModel;
using System.Globalization;
using System.Resources;

namespace Southville8BEdgeUI.Resources.Strings;

/// <summary>
/// Provides localized string resources for the Chat module
/// </summary>
public static class ChatResources
{
    private static ResourceManager? _resourceManager;
    private static CultureInfo? _resourceCulture;

    static ChatResources()
    {
        _resourceManager = new ResourceManager("Southville8BEdgeUI.Resources.Strings.ChatResources", 
            typeof(ChatResources).Assembly);
    }

    /// <summary>
    /// Gets or sets the culture used by this resource manager to look up culture-specific resources
    /// </summary>
    [EditorBrowsable(EditorBrowsableState.Advanced)]
    public static CultureInfo Culture
    {
        get => _resourceCulture ?? CultureInfo.CurrentCulture;
        set => _resourceCulture = value;
    }

    /// <summary>
    /// Returns the cached ResourceManager instance used by this class
    /// </summary>
    [EditorBrowsable(EditorBrowsableState.Advanced)]
    public static ResourceManager ResourceManager => _resourceManager ??= new ResourceManager(
        "Southville8BEdgeUI.Resources.Strings.ChatResources", typeof(ChatResources).Assembly);

    // UI Text Resources
    public static string NoConversationSelected => GetString(nameof(NoConversationSelected)) ?? "No Conversation Selected";
    public static string NoConversationsFound => GetString(nameof(NoConversationsFound)) ?? "No conversations found";
    public static string SearchCriteriaHint => GetString(nameof(SearchCriteriaHint)) ?? "Try adjusting your search criteria";
    public static string SelectConversation => GetString(nameof(SelectConversation)) ?? "Select a conversation";
    public static string ChooseConversationHint => GetString(nameof(ChooseConversationHint)) ?? "Choose a conversation from the list to start messaging";
    public static string MessagesHeader => GetString(nameof(MessagesHeader)) ?? "Messages";
    public static string AdminCommunicationHub => GetString(nameof(AdminCommunicationHub)) ?? "Admin Communication Hub";
    public static string NewButton => GetString(nameof(NewButton)) ?? "➕ New";
    public static string SearchWatermark => GetString(nameof(SearchWatermark)) ?? "Search conversations...";
    public static string AllUsersPlaceholder => GetString(nameof(AllUsersPlaceholder)) ?? "All Users";
    public static string TypeMessageWatermark => GetString(nameof(TypeMessageWatermark)) ?? "Type a message...";
    public static string SendButton => GetString(nameof(SendButton)) ?? "Send";
    public static string BackButton => GetString(nameof(BackButton)) ?? "←";
    public static string CallButton => GetString(nameof(CallButton)) ?? "📞";
    public static string VideoButton => GetString(nameof(VideoButton)) ?? "📹";
    public static string InfoButton => GetString(nameof(InfoButton)) ?? "ℹ️";
    public static string OnlineStatus => GetString(nameof(OnlineStatus)) ?? "Online";
    public static string OfflineStatus => GetString(nameof(OfflineStatus)) ?? "Offline";
    public static string DefaultRoleColor => GetString(nameof(DefaultRoleColor)) ?? "#6B7280";

    private static string? GetString(string name)
    {
        try
        {
            return ResourceManager.GetString(name, _resourceCulture);
        }
        catch (MissingManifestResourceException)
        {
            // Resource file not found, return null to use fallback
            return null;
        }
    }
}